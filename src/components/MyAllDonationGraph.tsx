import React, { useState } from "react";
import * as d3 from 'd3';
import { PieArcDatum } from 'd3-shape';
import "./css/MyAllDonationGraph.css";
import { useSelector } from 'react-redux';
import { RootState } from '../reducers';
import { pathToFileURL } from 'node:url';
    
interface MyData {
  name: string,
  value: number,
  color: string,
  percent: number,
}

let count = 0;

function MyAllDonationGraph(){
  const color = ['#efa86b', '#c1484f', '#d35d50', '#f4c17c', '#fae8a4', '#df7454', '#e88d5d', '#f8d690'];
  const state = useSelector((state: RootState) => state.mypageReducer);
  const { mypageInfo } = state;
  const [data, setData] = useState([
    {name: 'A', value: 1000, color: '#efa86b'},
  ])

  console.log(mypageInfo);

    let now = new Date();
    let yearNow = now.getFullYear();
    let monthNow = now.getMonth() + 1;
    let donates = mypageInfo.mypageInfo.donates;
    let arrangedData = [{name: "", value: 0, color: "", percent: 0}];
    let alreadyInNgo = { "": 0 };
  
    for(let i = 0; i < donates.length; i++){
      if(donates[i].type === "once" && !alreadyInNgo[donates[i].ngo.ngoName]){
        alreadyInNgo[donates[i].ngo.ngoName] = donates[i].money
      } 
      else if (donates[i].type === "once" && alreadyInNgo[donates[i].ngo.ngoName]) {
        alreadyInNgo[donates[i].ngo.ngoName] += donates[i].money
      } 
      else if(donates[i].type === "repeat" && !alreadyInNgo[donates[i].ngo.ngoName]) {
        let yearStart = donates[i].createdAt.slice(0, 4);
        let monthStart = donates[i].createdAt.slice(5, 7);
        if(donates[i].ing) {
          let howManyMonthIng = (yearNow - yearStart) * 12 - (monthStart - 1) + monthNow
          alreadyInNgo[donates[i].ngo.ngoName] = donates[i].money * howManyMonthIng;
        } 
        else {
          let yearEnd = donates[i].updatedAt.slice(0, 4);
          let monthEnd = donates[i].updatedAt.slice(5, 7);
          let howManyMonthNotIng = (yearEnd - yearStart) * 12 - (Number(monthStart) - 1) + Number(monthEnd)
          alreadyInNgo[donates[i].ngo.ngoName] = donates[i].money * howManyMonthNotIng;
        }
      }
      else if(donates[i].type === "repeat" && alreadyInNgo[donates[i].ngo.ngoName]){
        let yearStart = donates[i].createdAt.slice(0, 4);
        let monthStart = donates[i].createdAt.slice(5, 7);
        if(donates[i].ing) {
          let howManyMonthIng = (yearNow - yearStart) * 12 - (monthStart - 1) + monthNow
          alreadyInNgo[donates[i].ngo.ngoName] += donates[i].money * howManyMonthIng;
        } 
        else {
          let yearEnd = donates[i].updatedAt.slice(0, 4);
          let monthEnd = donates[i].updatedAt.slice(5, 7);
          let howManyMonthNotIng = (yearEnd - yearStart) * 12 - (Number(monthStart) - 1) + Number(monthEnd)
          alreadyInNgo[donates[i].ngo.ngoName] += donates[i].money * howManyMonthNotIng;
        }
      }
    }
  
    for(let key in alreadyInNgo){
      let newObj = {name: "", value: 0, color: "", percent: 0};
      newObj.name = key
      newObj.value = alreadyInNgo[key]
      arrangedData.push(newObj);
    }
    arrangedData.shift();
    arrangedData.shift();
    arrangedData = arrangedData.sort((a, b) => b.value - a.value);
    let total = arrangedData.reduce((acc, cur) => {return acc + cur.value}, 0)

    for(let i = 0; i < arrangedData.length; i++){
      arrangedData[i].color = color[i % 8];
      arrangedData[i].percent = arrangedData[i].value / total * 100
    }

    console.log(arrangedData);

    if(count === 0){
      const width = 400;
      const height = 400;
      
      const arc = d3.arc<PieArcDatum<MyData>>().innerRadius(75).outerRadius(Math.min(width, height) / 2);
      
      const arcLabel = (() => {
        const radius = Math.min(width, height) / 2 * 0.8;
        return d3.arc().innerRadius(radius).outerRadius(radius);
      })();
      
      const pie = d3.pie<MyData>(data)
        .sort((a, b) => b.value - a.value)
        .value(d => d.value);
      
      const arcs = pie(data);
      
      const svg = d3.select('#myAllDonationGraph').append('svg').style('width', width).style('height', height)
        .attr('text-anchor', 'middle')
        .style('font-size', '12px S-CoreDream');
      
      const g = svg.append('g')
        .attr('transform', `translate(${width/2}, ${height/2})`)
      
      g.selectAll('path')
        .data(arcs)
        .enter().append('path')
        .style("fill", function (d) {
          return d.data.color
        })
        .attr('stroke', 'white')
        .transition()
        .delay(function (d, i) {
          return i * 500;
        })
        .duration(500)
        .attrTween("d", function (d) {
          var i = d3.interpolate(d.startAngle + 0.1, d.endAngle);
          return function (t) {
            d.endAngle = i(t);
            return arc(d);
          };
        })

      const text = g.selectAll('text')
        .data(arcs)
        .enter().append('text')
          .attr('transform', (d: any) => `translate(${arcLabel.centroid(d)})`)
          .attr('dy', '0.35em');
      
      text.append('tspan')
        .attr('x', 0)
        .attr('y', '-0.7em')
        // .style('font-weight', 'bold')
        .text(d => d.data.name)
      
      text.filter(d => (d.endAngle - d.startAngle > 0.25)).append('tspan')
        .attr('x', 0)
        .attr('y', '0.7em')
        .attr('fill-opacity', 0.7)

      var div = d3.select('#myAllDonationGraph').append("div").attr("class", "toolTip");
      d3.selectAll("path")
      .on("mousemove", function(d){
        div.style("left", d.pageX + 10 + "px");
        div.style("top", d.pageY - 25 + "px");
        div.style("display", "inline-block");
        div.html(
          d.path[0].__data__.data.name + "<br>" + d.path[0].__data__.data.value + "<br>" + parseInt(d.path[0].__data__.data.percent) + "%"
        );
        d.target.style.opacity = 0.5;
      })

      d3.selectAll("path").on("mouseout", function (d) {
        div.style("display", "none");
        d.target.style.opacity = 1;
      });
      
      // svg.node();
    }

    window.addEventListener('scroll', () => {
      if(count === 0){
        d3.select('#myAllDonationGraph').selectAll("svg").remove();
        setData(arrangedData)
        count++;
      }
    })

  return (
      <div id="myAllDonationGraphContainer">
      <div className="myPageTitle">후원 그래프</div>
      <div className="myPageSubTitle">김빙고님의 총 후원내역을 단체별로 한눈에 살펴볼 수 있습니다.</div>
      <div id="myAllDonationGraph">
      </div>
    </div>
  )
}

export default MyAllDonationGraph;