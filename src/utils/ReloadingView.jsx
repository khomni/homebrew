import React, { Component } from 'react';

import { ITEMS_PER_PAGE } from '../constants'

import { withRouter } from 'react-router-dom';
import { graphql, withApollo, Query, Mutate } from 'react-apollo';
import { connect } from 'react-redux';
import { getSession } from '../actions';
import { PropTypes } from 'prop-types';

import ErrorView from '../components/Error';
import Loading from '../components/Loading';

import { ErrorList } from '../containers/Error';

/* ==============================
 * withResource / ReloadingView:
 *      Abstraction HOC that automatically connects to the apolloclient and redux store to load server data
 *      Goal: to simplify the amount of scaffolding required for a single resource view page using similar query logic and standardize
 *              1. error display
 *              2. result filtering controls
 *              3. result layout controls
 *
 *      A regular resource container wrapped with this HOC should check for these propTypes, provided by this HOC:
 *              dispatch: PropTypes.func.isRequired
 *              match: PropTypes.object.isRequired
 * ============================== */

export default function withResource(WrappedComponent, {query, variables, alias, subscription}) {

  // TODO: reimplement frontend filtering functionality
  class Wrapper extends Component {
    constructor(props) {
      super(props);
      this.setFilter = this.setFilter.bind(this)
      this.updateVariables = this.updateVariables.bind(this)

      let defaultFilter = Object.assign({
        search: '',
        layout: props.layout || null,
        key: 'updatedAt',
        order: -1,
        page: 0,
        results: ITEMS_PER_PAGE,
      }, this.props.filter || {})

      this.state = {
        mountedRoute: this.props.match.url,
        filter: defaultFilter,
        variables: typeof variables === 'function' ? variables(props) : variables
      }
    }

    setFilter(event) {
      let { name, value } = event.target
      let { filter } = this.state

      value = !isNaN(value) && value !== '' ? Number(value) : value

      this.setState({filter: {...filter, [name]: value}})
     }

    componentWillMount() {
      // if the props include a subscribe method, call it as soon as the component is ready to mount
      //        this will ensure that all reloading components will receive subscription events from the server
      const { subscribe } = this.props;
      if(subscribe) return subscribe();
    }

    updateVariables({target: {name, value, type}, keyCode = null, shiftKey}) {
      const { refetch } = this.props;
      const { variables } = this.state

      if(type === 'submit' || keyCode && keyCode === 13) {
        return refetch(variables);
      }
      value = typeof value === 'number' ? Number(value) : value || ''
      this.setState({variables: {...variables, [name]: value}})
    }

    render() {
      const { error, loading, refresh, dispatch } = this.props;
      const { filter, variables } = this.state;

      // console.log(this.props[alias || 'data']);

      if(error) return <ErrorView error={error} />
      if(loading) return <Loading/>
      return <WrappedComponent setFilter={this.setFilter} filter={filter} variables={variables} updateVariables={this.updateVariables} {...this.props}/>
    }
  }

  // Use the redux store to allow components to access the Session user / character / campaign.
  // TODO: add to this function if this standardized resource fetching mechanism needs to use more of the redux store
  // TODO: allow arguments to withResource to modify this mapping function?
  const mapStateToProps = ({session}) => ({session})

  // graphql container:
  // uses the input query to retrieve data, and returns it to be attached to the props
  // TODO: set polling interval (or subscription settings when applicable)
  let gContainer =  graphql(query, {

    // set the Wrappers props using the data returned by GraphQL endpoint and own props
    props: ({ownProps, data}) => {

      let props = {
        loading: data.loading,
        error: data.error,
        refetch: data.refetch,
        updateQuery: data.updateQuery,
        [alias || 'data']: alias ? data[alias] : data,
        data,
      };

      // console.log(alias, props);

      // EXPERIMENTAL: allow reloading components to include a subscription query that 
      //        automatically updates the cache when the server publishes it
      if(subscription) props.subscribe = (params) => data.subscribeToMore({
        document: subscription,
        variables: variables ? variables(ownProps) : null,
        updateQuery: (prev, {subscriptionData}) => { // returns a combination of the old data and the new data

          if(!subscriptionData.data) return prevasdfasdfasdfasdfasdfasdf
          // TODO: determine if this update is updating an existing object, or inserting an object into the current collection (if an array)
          console.warn('Subscription updates have not been fully implemented in ReloadingView.jsx;', 'previous value:', prev, 'pushed update:' , subscriptionData);
          return prev
        }
      })

      return Object.assign({}, ownProps, props);
    },
    options: props => ({
      variables: variables ? variables(props) : null
    })
  })(Wrapper)

  return withRouter(withApollo(connect(mapStateToProps)(gContainer)))
}

// improved resourceForm:
// this function returns a component that can interface with a resource type via React-controlled forms
// the returned component will have to have its contents rendered based on the dynamic content of the resource / form
export function resourceForm({mutation, variables, alias, formData, refetchQueries, onUpdate}) {

  /* ==============================
   * mutation: GQL query describing the resource manipulation
   * variables: an object with variable values OR a function that converts props to variables
   *    args: an object containing the received props
   * alias: (string) the name of the resource being modified 
   * formData: either a base object that describes the form's state, or a function that returns an object with the props
   *    args: an object containing the received props
   * onUpdate: a function that returns a function to perform after the mutation has been completed
   *    args: an object containing the received props
   * refetchQueries: an array of objects describing queries that should be rerun
   * ============================== */

  // 1. create a new component class using the parameters handed to the function
  class Wrapper extends Component {
    constructor(props) {
      super(props);
      this.submit = this.submit.bind(this);
      this.setFormData = this.setFormData.bind(this);

      // form data will be stored in state until submitted
      // TODO: allow errors to be dismissed
      this.state = { 
        formData: { },
        errors: [],
      }
    }

    componentWillMount() {
      let data
      // if formData is a function, use the inherited props to get the initial form data
      if(typeof formData === 'function') data = formData(this.props);
      // otherwise inherit it directly
      else data = formData

      for(let key in data) {
        data[key] = typeof data[key] === 'number' ? Number(data[key]) : data[key] || ''
      }

      this.setState({formData: data})
    }

    setFormData({ target: {name, value, type}}) {
      let { formData } = this.state
      value =  (type === 'number' || /[^\D]+/.test(value)) ? Number(value) : value || ''
      this.setState({formData: {...formData, [name]: value}})
    }

    // dispatches the mutation query
    // once the mutation is done, onUpdate will be called with the props passed to the component
    submit({keyCode = null, shiftKey = false}) {
      if(keyCode && (keyCode !== 13 || shiftKey)) return true;
      const { client } = this.props;
      const { formData } = this.state;
      let calcVariables = (typeof variables === 'function') ? variables(this.props) : variables

      console.log('calculated variables:', calcVariables);

      // capture submit events, unless created by any keystrokes except deliberate return

      return client.mutate({
        mutation,
        variables: {
          ...calcVariables,
          [alias]: formData
        },
        update: onUpdate && onUpdate(this.props),
        refetchQueries,
      })
      .catch(err => {
        let errors = this.state.errors.slice()
        let minErrorsLength = 5;

        // split error into component pieces if necessary
        if('graphQLErrors' in err) {
          minErrorsLength = Math.max(err.graphQLErrors.length, 5);
          errors = errors.concat(err.graphQLErrors)
        }
        else errors.push(err)

        errors = errors.slice(minErrorsLength * -1)

        // add this error to the components error list
        // send the error back to the component
        return this.setState({errors})
      })
    }

    render() {
      const { render, error, loading, refresh, dispatch } = this.props;
      const { formData, errors } = this.state
      if(error) return <ErrorView error={error}/>;
      if(loading) return <Loading/>;

      const { submit, setFormData } = this

      return (
        <div>
          {render({formData, submit, setFormData})}
          <ErrorList errors={errors} />
        </div>
      )

      // call the render prop, passing the formData object, submit function, and form data setter
      // return render({formData, submit, setFormData})
    }
  }

  Wrapper.propTypes = {
    render: PropTypes.func.isRequired,
  }

  const mapStateToProps = ({session}) => ({session})

  // Router: the React-Router provider gives the component access to route properties
  //    {match: { params, url} }
  // Apollo: give the component access to the apollo client connection properties
  // Connect (Redux): assigns redux state to properties, allows redux actions to be dispatched
  //    { dispatch }
  return withRouter(withApollo(connect(mapStateToProps)(Wrapper)))
}

