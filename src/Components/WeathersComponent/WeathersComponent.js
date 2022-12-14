import React, { useEffect, useState } from "react";
import "./WeathersComponent.css";

export default function WeathersComponent() {
  const [data, setData] = useState(null);
  const [state, setState] = useState({ urlTarget: "", titleTarget: "" });

  const API = `https://api.openweathermap.org/data/2.5/weather?q=tehran&appid=fc23c7530f93e9a5b87c232a3aff81df`;

  useEffect(() => {
    async function getData() {
      const actualData = await fetch(API).then((response) => response.json());
      setData(actualData);
    }

    getData();
  }, []);

  useEffect(() => {
    const queryInfo = { active: true, lastFocusedWindow: true };
    /* eslint-disable no-undef */
    chrome.tabs.query(queryInfo, (tabs) => {
      const urlTarget = tabs[0].url;
      const titleTarget = tabs[0].title;
      setState({ urlTarget, titleTarget });
    });
  }, []);

  function elementGenerator() {
    chrome.storage.get("state", ({ state }) => {
      let child = document.createElement("div", {}, "children");
      let title = document.createElement("h5", "title");
      let url = document.createElement("h5", "url");
      title.innerHTML = `title:${state.title}`;
      url.innerHTML = `url:${state.url}`;
      child.setAttribute(
        "style",
        "background-color:#293462,width:100%,height:40px,position:fixed"
      );
      child.appendChild(title);
      child.appendChild(url);
      const referenceNode = document.body.lastChild;
      insertAfter(referenceNode, child);
    });
  }

  function insertAfter(referenceNode, newNode) {
    referenceNode.parentNode.insertBefore(newNode, referenceNode.nextSibling);
  }

  function btnAction() {
    /* eslint-disable no-undef */
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      const activeTabId = tabs[0].id;
      chrome.scripting.executeScript({
        target: { tabId: activeTabId },
        function: elementGenerator,
      });
    });
  }

  function mainAction() {
    chrome.storage.sync.set({ state: state });
    btnAction();
  }

  return (
    <div className="Wrapper">
      <div className="Title">
        <img src="./logo.png" className="logo" />
        <h4 style={{ color: "gold" }}>{state.titleTarget}</h4>
        <h6>{state.urlTarget.split("?")[0]}</h6>
      </div>
      <div className="Content">
        {data &&
          data.weather.map((item) => {
            return (
              <div>
                <div className="section">
                  <p>
                    <span>Temp</span> :{" "}
                    {data && Math.round(Number(data.main.temp) - 273.15)} C
                  </p>
                  <img
                    src={
                      "https://api.openweathermap.org/img/w/" +
                      item.icon +
                      ".png"
                    }
                  />
                </div>
                <p>
                  <span>city name</span> : {data && data.name}
                </p>

                <p>
                  <span>weather</span> : {item.main}
                </p>
                <p>
                  <span>description</span> : {item.description}
                </p>
              </div>
            );
          })}
      </div>
      <button onClick={mainAction}>Inject</button>
    </div>
  );
}
