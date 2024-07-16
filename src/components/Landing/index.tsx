import React, { FC, useContext } from "react";
import Layout from "../../Layout";
import "./index.css";
import Cover from "../../assets/landing-cover.svg";
import Icon1 from "../../assets/landing-icon-1.svg";
import Icon2 from "../../assets/landing-icon-2.svg";
import Icon3 from "../../assets/landing-icon-3.svg";
import Supported from "../../assets/supported.svg";
import SupportedDark from "../../assets/supported-dark.svg";
import ThemeContext from "../../ThemeContext";

const Landing: FC = () => {
  return (
    <Layout>
      <ThemeContext.Consumer>
        {(theme) => (
          <div className="landing-page">
            <div className="landing-page-content">
              <div className="left-bar">
                <div className="circle"></div>
                <div
                  className="line"
                  style={{
                    height: "400px",
                    background: `linear-gradient(180deg, rgba(119, 223, 69, 0) 0%, #77DF45 22%, #F3F72C 100%)`,
                  }}
                ></div>
                <img src={Icon1} alt="" />
                <div
                  className="line"
                  style={{
                    height: "200px",
                    background: `linear-gradient(180deg, #F3F72C 0%, #F7A62C 100%)`,
                  }}
                ></div>
                <img src={Icon2} alt="" />
                <div
                  className="line"
                  style={{
                    height: "272px",
                    background: `linear-gradient(180deg, #F7C42C 23%, #F7692C 83.91%)`,
                  }}
                ></div>
                <img src={Icon3} alt="" />
                <div
                  className="line"
                  style={{
                    height: "200px",
                    background: `linear-gradient(180deg, #F7692C 16%, #F7692C 73%, rgba(247, 105, 44, 0) 100%)`,
                  }}
                ></div>
              </div>
              <div className="landing-content">
                <div className="block" style={{ height: "450px" }}>
                  <img className="cover" src={Cover} alt="" />
                  <div className="slogan">
                    Lorem Ipsum, Consectetur Poer Duet Sageto
                  </div>
                  <div className="buttons">
                    <button className="btn black">Start Now</button>
                    <button className="btn">View The Doc</button>
                  </div>
                </div>
                <div className="data-block">
                  <div className="item">
                    <span className="label">Data Title</span>
                    <span className="value">$207m</span>
                  </div>
                  <div className="item">
                    <span className="label">Data Title</span>
                    <span className="value">$41.7m</span>
                  </div>
                  <div className="item">
                    <span className="label">Data Title</span>
                    <span className="value">$374.1k</span>
                  </div>
                </div>
                <div className="support">
                  <div className="subtitle">
                    Supported by the world’s leading blockchain projects
                  </div>
                  <img
                    src={theme === "dark" ? SupportedDark : Supported}
                    alt=""
                  />
                </div>
                <div className="medias">
                  <div className="item">
                    <div className="title">Follow Us</div>
                    <div className="inner">Twitter/Discord</div>
                  </div>
                  <div className="item">
                    <div className="title">Develop</div>
                    <div className="inner">Developer portal</div>
                  </div>
                  <div className="item">
                    <div className="title">Bug bounty</div>
                    <div className="inner">Bug bounty program</div>
                  </div>
                  <div className="item">
                    <div className="title">Learn more</div>
                    <div className="inner">Documentation</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </ThemeContext.Consumer>
    </Layout>
  );
};

export default Landing;
