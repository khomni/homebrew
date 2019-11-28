import React from 'react';
import withResource, { resourceForm } from '../utils/ReloadingView'

import { IMAGE_UPLOAD } from '../../graphql/mutations'

export const ImageForm = resourceForm({
  mutation: IMAGE_UPLOAD,
  alias: 'image',
  variables: ({imageable}) => ({
    imageable_id: imageable && imageable.id,
    imageableType: imageable && imageable.__typename
  }),
  formData: ({imageable}) => ({
  
  }),
  onUpdate: () => {
  
  }
});

const UploadImage = ({imageable}) => (
  <div>
    <ImageForm imageable={imageable} render={({submit, formData, setFormData}) => (
      <div>
        <label className="btn">
          <span>Select Files</span>
          <input
            type="file"
            name="file"
            className="image-upload"
            onChange={setFormData}
          />
        </label>
        <button className="btn" onClick={submit}>Upload</button>
      </div>
    )}/>
  </div>
)

export default UploadImage

class Image extends React.Component {
  constructor(props) {
    super(props);
  }

}

