import { Box, Stack, TextField } from "@mui/material";
import * as echarts from "echarts";
import { useState, useEffect, useRef, useContext } from "react";
import Layout from "./Layout";
import styled from "@emotion/styled";
import searchIcon from "./assets/search.svg";
import bgimg from "./assets/bgimg.svg";
import ThemeContext from "./ThemeContext";

const StyledInput = styled(TextField)({
  "& .Mui-focused .MuiOutlinedInput-notchedOutline": {
    border: "1px solid rgba(69, 72, 81, 0.1) !important",
  },
  "& .MuiOutlinedInput-notchedOutline": {
    border: "1px solid rgba(69, 72, 81, 0.1) !important",
  },
  "& .MuiOutlinedInput-root:hover .MuiOutlinedInput-notchedOutline": {
    border: "1px solid rgba(69, 72, 81, 0.1) !important",
  },
  "& .MuiOutlinedInput-root": {
    padding: "0 0 0 20px",
    minHeight: "30px",
    background: "var(--swap-bg)",
    color: "var(--info-placeholder)",
  },
});

const data = [
  {
    timestamp: 1664409600,
    value: 1346706.9384081645,
    reward_per_vote: 0.0027039476289622,
    total_vote: 498052153.0755493,
  },
  {
    timestamp: 1665014400,
    value: 1343774.9591441648,
    reward_per_vote: 0.0026705040749233,
    total_vote: 503191502.96851134,
  },
  {
    timestamp: 1665619200,
    value: 1081646.741003971,
    reward_per_vote: 0.0021573753982957,
    total_vote: 501371593.39931387,
  },
  {
    timestamp: 1666224000,
    value: 1086733.8837239712,
    reward_per_vote: 0.0021560383721393,
    total_vote: 504041995.6188872,
  },
  {
    timestamp: 1666828800,
    value: 1708134.7044809703,
    reward_per_vote: 0.0033326116744495,
    total_vote: 512551377.52080125,
  },
  {
    timestamp: 1667433600,
    value: 1575416.5973432434,
    reward_per_vote: 0.003060038449615,
    total_vote: 514835556.2465168,
  },
  {
    timestamp: 1668038400,
    value: 1070326.43624412,
    reward_per_vote: 0.0020833111919039,
    total_vote: 513762149.60279983,
  },

  {
    timestamp: 1677715200,
    value: 1310473.9636717334,
    reward_per_vote: 0.0024176229950342,
    total_vote: 542050587.0284332,
  },
  {
    timestamp: 1678320000,
    value: 1301664.0418436034,
    reward_per_vote: 0.0023944901738704,
    total_vote: 543608011.4455608,
  },
  {
    timestamp: 1678924800,
    value: 954708.7193231955,
    reward_per_vote: 0.0017566218572803,
    total_vote: 543491312.8095462,
  },
  {
    timestamp: 1679529600,
    value: 953969.0458456154,
    reward_per_vote: 0.0017339404199437,
    total_vote: 550174063.0030274,
  },

  {
    timestamp: 1682553600,
    value: 1148848.9936959126,
    reward_per_vote: 0.0020808878847969,
    total_vote: 552095575.2058791,
  },
  {
    timestamp: 1683158400,
    value: 1170889.760951951,
    reward_per_vote: 0.0021153635877791,
    total_vote: 553517025.4969162,
  },
  {
    timestamp: 1683763200,
    value: 1174567.5234484978,
    reward_per_vote: 0.0021323817259014,
    total_vote: 550824230.5687499,
  },

  {
    timestamp: 1689811200,
    value: 1278650.1170447867,
    reward_per_vote: 0.0021866694952582,
    total_vote: 584747772.7281412,
  },
];

const lineData = data.map((item) => {
  return { value: item.reward_per_vote };
});
const HeaderItem = (props) => {
  return (
    <Box
      sx={{
        fontWeight: "300",
        fontSize: "16px",
        flex: "1 1 0px",
        textAlign: props.left ? "left" : "right",
      }}
      {...props}
    >
      {props.children}
    </Box>
  );
};

const TokenListItem = (props) => {
  return (
    <Box
      sx={{
        fontWeight: props.bold ? "400" : "300",
        fontSize: "16px",
        flex: "1 1 0px",
        textAlign: props.left ? "left" : "right",
        color: "var(--light-color)",
      }}
      {...props}
    >
      {props.children}
    </Box>
  );
};

const InfoContent = (props) => {
  const chartRef = useRef();
  const lineChartRef = useRef();
  const currentTheme = useContext(ThemeContext);
  useEffect(() => {
    chartRef.current = echarts.init(
      document.querySelector("#barchart-container")
    );
    chartRef.current.setOption({
      // tooltip: {
      //   show: true,
      //   trigger: "axis",
      //   backgroundColor: "#4C4C4C",
      //   borderColor: "#4C4C4C",
      //   textStyle: {
      //     color: "#fff",
      //     fontFamily: "ChillPixels Mono",
      //     fontSize: 12,
      //   },
      //   padding: [2, 5],
      // },
      grid: {
        containLabel: true,
        top: 50,
        bottom: 30,
        left: -60,
        right: 30,
      },
      xAxis: {
        type: "category",
        data: [],
        axisLabel: { color: "#999", rotate: 60 },
        axisTick: { show: true },
        axisLine: { show: false },
        z: 10,
      },
      yAxis: [
        {
          show: false,
          type: "value",
          splitLine: { show: false },
          min: 0,
          // max: 30000000,
          position: "left",
          axisLine: { show: false },
        },
        {
          type: "value",
          splitLine: { show: false },
          axisLine: { show: false },
          position: "right",
          axisLabel: {
            formatter(value) {
              return `$${value}`;
            },
          },
        },
      ],
      series: [
        {
          name: "value",
          type: "bar",
          barMaxWidth: 45,
          barGap: "16px",
          data,
          barWidth: "18px",
          itemStyle: {
            color: new echarts.graphic.LinearGradient(
              0,
              1,
              0,
              0,
              [
                {
                  offset: 0,
                  color: "rgba(255, 232, 4, 0.04)", // 0% 处的颜色
                },

                {
                  offset: 1,
                  color: "rgba(255, 138, 2, 1)", // 100% 处的颜色
                },
              ],
              false
            ),
          },
          yAxisIndex: 0,
          tooltip: {
            show: true,
            trigger: "item",
            backgroundColor: "#4C4C4C",
            borderColor: "#4C4C4C",
            textStyle: {
              color: "#fff",
              fontFamily: "ChillPixels Mono",
              fontSize: 12,
            },
            padding: [2, 5],
          },
          // emphasis: {
          //   itemStyle: {
          //     color: {
          //       colorStops: [
          //         { offset: 0, color: "#FF460E" },
          //         { offset: 0.44, color: "#ECA13F" },
          //         { offset: 1, color: "#00DD59" },
          //       ],
          //       x: 0,
          //       y: 0,
          //       x2: 0,
          //       y2: 1,
          //       type: "linear",
          //       global: false,
          //     },
          //   },
          // },
        },
      ],
    });
    lineChartRef.current = echarts.init(
      document.querySelector("#linechart-container")
    );
    lineChartRef.current.setOption({
      //   legend: {
      //     textStyle: {
      //       color: "#1dd186",
      //     },
      //     data: ["value", key],
      //   },
      tooltip: {
        show: true,
        trigger: "axis",
        backgroundColor: "#4C4C4C",
        borderColor: "#4C4C4C",
        textStyle: {
          color: "#fff",
          fontFamily: "ChillPixels Mono",
          fontSize: 12,
        },
        padding: [2, 5],
        // formatter(params, ticket) {
        //   if (params) {
        //     const index =
        //       params?.[0]?.dataIndex !== undefined
        //         ? params?.[0]?.dataIndex
        //         : params.dataIndex;

        //     const data = window.chartData[index];

        //     // const { data } = params;
        //     return `${moment(data.timestamp * 1000)
        //       .format("yyyy-MM-DD")
        //       .toString()}
        //         <br/>
        //       value:${numbro(data.value).format({
        //         average: true,
        //         totalLength: 3,
        //       })}<br/>
        //       ${key}:${data.reward_per_vote.toFixed(3)}
        //       `;
        //   }
        // },
      },
      grid: {
        containLabel: true,
        top: 50,
        bottom: 40,
        left: 30,
        right: -30,
      },
      xAxis: {
        type: "category",
        data: [],
        axisLabel: { color: "#999", rotate: 60 },
        axisTick: { show: true },
        axisLine: { show: false },
        z: 10,
      },
      yAxis: [
        {
          type: "value",
          // splitLine: { show: true },
          min: 0,
          // max: 30000000,
          position: "left",
          axisLine: { show: false },
          //   axisLabel: {
          //     formatter(value) {
          //       return numbro(value).format({
          //         average: true,
          //         totalLength: 3,
          //       });
          //     },
          //   },
        },
        {
          show: false,
          type: "value",
          splitLine: { show: false },
          // show: false,
          // min: 0,
          // max: 1,
          position: "right",
          axisLabel: {
            formatter(value) {
              return `$${value}`;
            },
          },
        },
      ],
      series: [
        {
          //   name: key,
          data: lineData,
          itemStyle: {
            color: "#eca13f",
          },
          type: "line",
          symbol: "none",
          smooth: true,
          yAxisIndex: 1, // Use the second Y-axis
        },
      ],
    });
  }, []);
  useEffect(() => {
    window.addEventListener("resize", function () {
      chartRef.current.resize();
      lineChartRef.current.resize();
    });
  }, []);
  return (
    <Box
      sx={{
        padding: "0 64px",
        position: "relative",
        borderTop: "1px solid rgba(69, 72, 81, 0.1)",
      }}
    >
      <Box
        sx={{
          position: "absolute",
          left: "50%",
          transform: "translate(-50%)",
        }}
      >
        <img src={bgimg} style={{ height: "90vh" }}></img>
      </Box>
      <Box sx={{ position: "relative" }}>
        <Box
          sx={{
            borderTop: "1px solid rgba(69, 72, 81, 0.1)",
            paddingTop: "40px",
          }}
        >
          <Stack justifyContent={"center"} direction={"row"} textAlign={"left"}>
            <Box
              sx={{
                background: "var(--content-bg)",
                // width: "600px",
                height: "345px",
                padding: "20px",
                paddingRight: "0",
                borderRadius: "16px",
                marginRight: "20px",
                flex: "1 1 0px",
              }}
            >
              <Box
                sx={{
                  fontWeight: "600",
                  fontSize: "16px",
                  marginBottom: "12px",
                  color: "var(--light-color)",
                }}
              >
                TVL
              </Box>
              <Box
                sx={{
                  fontWeight: "600",
                  fontSize: "28px",
                  marginBottom: "4px",
                  color: "var(--light-color)",
                }}
              >
                $348.36M
              </Box>
              <Box
                sx={{
                  fontWeight: "500",
                  fontSize: "14px",
                  marginBottom: "4px",
                  color: "var(--timepick-color)",
                }}
              >
                January 4, 2024
              </Box>
              <Box id="barchart-container" sx={{ height: "200px" }}></Box>
            </Box>
            <Box
              sx={{
                background: "var(--content-bg)",
                // width: "600px",
                height: "345px",
                padding: "20px",
                borderRadius: "16px",
                flex: "1 1 0px",
              }}
            >
              <Box
                sx={{
                  fontWeight: "600",
                  fontSize: "16px",
                  marginBottom: "12px",
                  color: "var(--light-color)",
                }}
              >
                Volume 24H
              </Box>
              <Box
                sx={{
                  fontWeight: "600",
                  fontSize: "28px",
                  marginBottom: "4px",
                  color: "var(--light-color)",
                }}
              >
                $189.95M
              </Box>
              <Box
                sx={{
                  fontWeight: "500",
                  fontSize: "14px",
                  marginBottom: "4px",
                  color: "var(--timepick-color)",
                }}
              >
                January 4, 2024
              </Box>
              <Box id="linechart-container" sx={{ height: "200px" }}></Box>
            </Box>
          </Stack>
        </Box>
        <Box
          sx={{
            textAlign: "left",
            borderRadius: "20px",
            marginTop: "20px",
            padding: "20px",
            background: "var(--content-bg)",
          }}
        >
          <Stack
            direction={"row"}
            alignItems={"center"}
            justifyContent={"space-between"}
            sx={{ height: "96px" }}
          >
            <Box
              sx={{
                fontSize: "18px",
                fontWeight: "600",
                color: "var(--light-color)",
              }}
            >
              Top Tokens
            </Box>
            <Box sx={{ position: "relative" }}>
              <Box
                sx={{
                  position: "absolute",
                  top: "55%",
                  left: "10px",
                  transform: "translate(0,-50%)",
                  zIndex: "100",
                }}
              >
                <img src={searchIcon} />
              </Box>
              <StyledInput
                sx={{
                  width: "430px",
                  height: "48px",
                }}
                autoComplete="off"
                placeholder="Search by token name or address"
                // variant="standard"
              />
            </Box>
          </Stack>
          <Box
            sx={{
              border: "1px solid rgba(69, 72, 81, 0.1)",
              paddingTop: "25px",
              borderRadius: "20px",
            }}
          >
            <Stack
              direction={"row"}
              sx={{
                borderBottom: "1px solid rgba(69, 72, 81, 0.1)",
                paddingBottom: "10px",
                padding: "8px",
              }}
            >
              <HeaderItem left>#</HeaderItem>
              <HeaderItem left>Name</HeaderItem>
              <HeaderItem>Price</HeaderItem>
              <HeaderItem>Price Change</HeaderItem>
              <HeaderItem>Volume 24H</HeaderItem>
              <HeaderItem>TVL</HeaderItem>
            </Stack>
            <Stack
              direction={"row"}
              sx={{
                height: "66px",
                padding: "8px",
                alignItems: "center",
                background: "var(--active-tokeninfo-bg)",
              }}
            >
              <TokenListItem left>1</TokenListItem>
              <TokenListItem left bold>
                USDT
              </TokenListItem>
              <TokenListItem>1.00</TokenListItem>

              <TokenListItem>0.01%</TokenListItem>
              <TokenListItem>$59.53m</TokenListItem>
              <TokenListItem>$66.46m</TokenListItem>
            </Stack>
            <Stack
              direction={"row"}
              sx={{
                height: "66px",
                alignItems: "center",
                padding: "8px",
                background: "var(--swap-tab)",
              }}
            >
              <TokenListItem left>1</TokenListItem>
              <TokenListItem left bold>
                USDT
              </TokenListItem>
              <TokenListItem>1.00</TokenListItem>

              <TokenListItem>0.01%</TokenListItem>
              <TokenListItem>$59.53m</TokenListItem>
              <TokenListItem>$66.46m</TokenListItem>
            </Stack>
            <Stack
              direction={"row"}
              sx={{
                height: "66px",
                alignItems: "center",
                padding: "8px",
                background: "var(--swap-tab)",
              }}
            >
              <TokenListItem left>1</TokenListItem>
              <TokenListItem left bold>
                USDT
              </TokenListItem>
              <TokenListItem>1.00</TokenListItem>

              <TokenListItem>0.01%</TokenListItem>
              <TokenListItem>$59.53m</TokenListItem>
              <TokenListItem>$66.46m</TokenListItem>
            </Stack>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

const Info = () => {
  return (
    <Layout>
      <InfoContent />
    </Layout>
  );
};
export default Info;
