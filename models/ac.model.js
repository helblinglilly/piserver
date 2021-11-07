const axios = require("axios");

exports.GetFishDetails = (fishName) => {
  if (!fishName || fishName.length === 0) {
    return new Promise.reject({
      status: 400,
      msg: "Please enter a valid fish name",
    });
  }
  fishName = fishName.toLowerCase().replaceAll(" ", "_");

  axios.get(`http://acnhapi.com/v1/fish/${fishName}`).then((response) => {
    if (response.status === 404) {
      return new Promise.reject({ status: 404, msg: "Fish not found" });
    }
    if (response.status !== 200) {
      return new Promise.reject({
        status: response.status,
        msg: response.statusText,
      });
    }
    if (response.status === 200) {
      return response.data;
    }
  });
};
