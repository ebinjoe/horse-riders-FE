import React, { useState, useEffect } from "react";
import axios from "axios";
import { v4 as uuidv4 } from "uuid";
import "./styles.css";

export default function App() {
  const [file, setFile] = useState(null);
  const [table, setTable] = useState();

  const handleFileSelect = (selectedFile) => {
    setFile(selectedFile);
  };

  useEffect(() => {
    if(localStorage.getItem("data")) {
      setTable(JSON.parse(localStorage.getItem("data")))
    }
  }, [])

  const handleUpload = async () => {
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("id", uuidv4());

      await axios
        .post("http://localhost:8000/upload/", formData, {
          headers: {
            "Content-Type": "multipart/form-data"
          }
        })
        .then(
          (res) => {
            setTable(res.data.status);
            localStorage.setItem("data",JSON.stringify(res.data.status))
          },
          (err) => console.log(err, "dd")
        );
    } catch (error) {
      console.error("Error uploading file:", error);
    }
  };

  const groupedData = table?.reduce((groups, item) => {
    const groupKey = item.class;
    if (!groups[groupKey]) {
      groups[groupKey] = [];
    }
    groups[groupKey].push({ rider: item.rider, horse: item.horse });
    // groups[groupKey].push(item.horse);
    return groups;
  }, {});

  return (
    <div className="App">
      <div className="d-flex border m-2 rounded shadow-sm flex-column gap-4 align-items-start p-3">
        <FileInput onFileSelect={handleFileSelect} />
        <div>
          <button className="btn btn-primary" onClick={handleUpload}>
            Upload
          </button>
        </div>
      </div>
      <div style={{ margin: "20px 10px 10px 10px" }}>
        {groupedData &&
          Object.keys(groupedData).map((groupKey) => (
            <div className="border p-2 mt-1 rounded" key={groupKey}>
              <h2 className="h6 text-primary">Class: {groupKey}</h2>
              <table className="table table-bordered table-stripped table-hover">
                <thead className="table-dark">
                  <tr>
                    <th>Serial Number</th>
                    <th>Rider Name</th>
                    <th>Horse Name</th>
                  </tr>
                </thead>
                <tbody>
                  {groupedData[groupKey].map((participant, index) => (
                    <tr key={index}>
                      <td>{index + 1}</td>
                      <td>{participant.rider}</td>
                      <td> {participant.horse}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ))}
      </div>
    </div>
  );
}

const FileInput = ({ onFileSelect }) => {
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    onFileSelect(file);
  };

  return (
    <div className="d-flex align-items-start flex-column">
      <h6>Select File to Upload</h6>
      <div>
        <input
          className="form-control"
          type="file"
          onChange={handleFileChange}
        />
      </div>
    </div>
  );
};
