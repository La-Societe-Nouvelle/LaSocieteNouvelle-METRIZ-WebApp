import api from "../../config/api";

import { SocialFootprint } from "/src/footprintObjects/SocialFootprint.js";


export const fetchMinFootprint = async () =>
{
  let footprint = await api.get("defaultfootprint?code=FPT_MIN_DIVISION&aggregate=TRESS&area=FRA")
    .then((res) => 
    {
      let status = res.data.header.code;
      if (status == 200) {
        let data = res.data;
        let footprint = new SocialFootprint();
        footprint.updateAll(data.footprint);
        return footprint;
      } else {
        return null;
      }
    }).catch((err) => {
      console.log(err);
      return null;
    });
  return footprint;
}

export const fetchMaxFootprint = async () =>
{
  let footprint = await api.get("defaultfootprint?code=FPT_MAX_DIVISION&aggregate=TRESS&area=FRA")
    .then((res) => 
    {
      let status = res.data.header.code;
      if (status == 200) {
        let data = res.data;
        let footprint = new SocialFootprint();
        footprint.updateAll(data.footprint);
        return footprint;
      } else {
        return null;
      }
    }).catch((err) => {
      console.log(err);
      return null;
    });
  return footprint;
}