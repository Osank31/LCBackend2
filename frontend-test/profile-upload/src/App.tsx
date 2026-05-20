import React, { useState } from "react";

export const App = () => {
	const [imageFile, setImageFile] = useState<File | null>(null);

	const handleChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
		try {
      const file = e?.target?.files?.[0] || null;
      
      		if (!file) {
      			return;
      		}
      		setImageFile(file);
      
      		//get mime
      		console.log(file);
      		const mimeType = file.type.split("/")[1];
      		// console.log(mimeType)
      		// send req to server
      
          const response = await fetch('http://localhost:3000/api/v1/auth/presigned-url', {
            method: "POST",
            headers :{
              "content-type": "application/json"
            },
            body: JSON.stringify({mimeType})
          })
      
          if (!response.ok) {
            console.log("error gettig presigned url")
          }
      
          const data = await response.json()
      
          console.log(data)
      
          const {preSignedUrl, fileName} = data.data

          console.log(preSignedUrl)
      
          const uploadResponse = await fetch(preSignedUrl, {
              method: "PUT",
              headers: {
                "Content-Type": file.type,
              },
              body: file,
            });
      
            if (!uploadResponse.ok) {
              throw new Error("Upload failed");
            }
            
            console.log("Uploaded successfully");
            console.log("File URL:", fileName);
      
            alert("Upload successful!");
    } catch (error) {
      console.log(error)
    }
	};

	return (
		<>
			<input type="file" onChange={handleChange} name="" id="" />
		</>
	);
};

export default App;
