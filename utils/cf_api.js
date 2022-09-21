import fetch from "node-fetch";

class CodeforcesAPI {
    static async api_response(url, params) {
      try {
        let tries = 0;
        let returnObj;
        while (tries < 5) {
          tries++;
          let responseData;
          await fetch(url, params).then(
            async (res) => {
              if (res.status === 503) { // Limit exceeded error
                responseData.status = "FAILED"; responseData.comment = 'limit exceeded';
                await new Promise(r => setTimeout(r, 1000));
              } else {
                responseData = await res.json();
              }
            }
          );
          if (responseData.status === "OK") return responseData;
          returnObj = responseData;
        }
        return returnObj; // Return if fail after 5 tries and not limit exceeded
      } catch(e) {
        console.log(e);
        return false;
      }
    }
  
    static async check_handle(handle) {
      const url = `https://codeforces.com/api/user.info?handles=${handle}`;
      const response = await this.api_response(url);
      if (!response) {
        return [false, "Codeforces API Error"];
      }
      if (response.status === "FAILED") {
        return [false, response.comment];
      }
      return [true, response.result[0]];
    }
  
    static async get_user_submissions(handle) {
      const url = `https://codeforces.com/api/user.status?handle=${handle}`;
      const response = await this.api_response(url);
      if (!response) return [false, "CF API Error"];
      if (response.status !== 'OK') return [false, response.comment];
      try {
        let data = [];
        response.result.forEach((submission) => {
          let problem = submission.problem;
          if (!problem.hasOwnProperty('rating')) return;
          if (!submission.hasOwnProperty('verdict')) submission.verdict = null;
          data.push({
            contestId: problem.contestId,
            index: problem.index,
            name: problem.name,
            type: problem.type,
            rating: problem.rating,
            creationTimeSeconds: submission.creationTimeSeconds,
            verdict: submission.verdict
          });
          return [true, data];        
        });
      } catch (e) {
        return [false, e.message];
      }
    }
  
    static async get_contest_list() {
      const url = "https://codeforces.com/api/contest.list";
      const response = await this.api_response(url);
      if (!response) {
        return false;
      }
      return response['result'];
    }
  
    static async get_problem_list() {
      const url = "https://codeforces.com/api/problemset.problems";
      const response = await this.api_response(url);
      if (!response) {
        return false;
      }
      return response['result']['problems'];
    }
  }
  
  export default CodeforcesAPI;