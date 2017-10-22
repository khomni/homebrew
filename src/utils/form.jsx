/* ==============================
 * From Utilities
 *      functions you can bind to a container to make forms work
 * ============================== */

export function submitData() {
    let { action, method, match } = this.props;
    let { body } = this.state;

    return fetch(action, {method, body, credentials: 'include', headers: {Accept: 'application/json'}})
    .then(response => { })
    .catch(err => { err })

}

export function setData() {

}

export default class Form extends Component {
  constructor(props) {
    super(props);
    this.submitData = this.submitData.bind(this);

    this.state = {
      body: {}
    }
  }

  submitData() {

  }

  render() {
    return (
      <form>
        {this.props.children}
      </form>
    )
  }

}

