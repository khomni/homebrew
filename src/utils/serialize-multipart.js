// converts a file or file list into valid multipart/form-data


export default (file) => {

  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = function(){
      console.log(this.result)
      let arrayBuffer = this.result;
      let array = new Uint8Array(arrayBuffer);
      let binaryString = String.fromCharCode.apply(null, array); 

      return resolve(binaryString)
    }

    reader.readAsArrayBuffer(file)
  
  });

}
