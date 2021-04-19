import React from "react";
import { useSelector } from 'react-redux';
import { RootState } from '../reducers';
import "./css/MyRegularDonationList.css";
import MyRegularDonationListEntry from "./MyRegularDonationListEntry"


function MyRegularDonationList(){
  const state = useSelector((state: RootState) => state.mypageReducer);
  const { mypageInfo } = state;
  const donates = mypageInfo.mypageInfo.donates
  console.log(donates)
  let count = 0;

  donates.map((item: any) => {
    if(item.type === "repeat" && item.ing === true){
      count++;
    }
  })
  
  return (
  <>
  
  <div id="myRegularDonationListContainer">
    <div className="myPageTitle">현재 정기후원 중인 단체</div>
    <div className="myPageSubTitle">우측 해지버튼을 통해 정기후원을 간편하게 취소하실 수 있습니다.</div>
    <div id="regularDonationBox">{
    count === 0 ? <div>현재 후원중인 단체가 없습니다.</div> :
      donates.map((item: any) => {
        if(item.type === "repeat" && item.ing === true){
          return (<MyRegularDonationListEntry money={item.money} ngoName={item.ngo.ngoName} donateId={item.donateId}/>)
        }
      })
    }
    </div>
    
  </div>
  
  </>
  )
}

export default MyRegularDonationList;