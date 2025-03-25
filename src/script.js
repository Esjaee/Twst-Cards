body {
    margin: 0;
    padding: 0;
    background-color: #393041;
    height: 100vh;
    display: flex;
    justify-content: center;
    align-items: center;
}

.container {
    width: 90%;
    max-width: 1200px;
    height: 80vh;
    background-color: #f1f0ec;
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 30px;
    position: relative;
    
      /* Layered solid borders using box-shadow */
    box-shadow:
    inset 0 0 0 8px #b4a073,
    inset 0 0 0 16px #f1f0ec, 
    inset 0 0 0 19px #b4a073; 
}

.container::before {
  content: "";
  position: absolute;
  top: 25px;  /* offset to stay inside */
  bottom: 25px;
  left: 25px;
  right: 25px;
  border-left: 4px dotted #b4a073;
  border-right: 4px dotted #b4a073;
  pointer-events: none;
  box-sizing: border-box;
}

.filter-button-space {
    width: 95%;
    display: flex;
    justify-content: right;
    margin-bottom: 10px;
}

.filter-button {
    padding: 10px 20px;
    background: linear-gradient(to bottom, #282828 50%, #0f0f0f 50%);
    color: #f0efeb;
    border: 2px solid #b4a073;
    border-radius: 6px;
    cursor: pointer;
    transition: background-color 0.3s ease;
}

.filter-button:hover {
    background: linear-gradient(to bottom, #282828 50%, #0f0f0f 50%);
    color: #b4b4b4;
    border: 2px solid #b4a073;
    border-radius: 6px;
}

.grid-space {
    width: 95%;
    height: 90%;
    background-color: #c8c7c7;
}
