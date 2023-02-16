"use strict";

const db = {};

module.exports = function (app) {
  app
    .route("/api/issues/:project")

    .get(function (req, res) {
      const project = req.params.project;
      const query = req.query;
      // console.log("\nGET", project, query);
      let issues = db[project];

      if (Object.keys(query).length > 0) {
        Object.entries(query).forEach((entry) => {
          const key = entry[0];
          const val = entry[1];
          issues = issues.filter((obj) => {
            if (key === "open") {
              return obj[key] === (val === "true");
            } else {
              return obj[key] === val;
            }
          });
        });
      }

      // console.log("Response :", issues);
      return res.json(issues);
    })

    .post(function (req, res) {
      const { body } = req;
      const project = req.params.project;
      // console.log("\nPOST", project, body);

      if (!body.issue_title || !body.issue_text || !body.created_by) {
        // console.log("Response :", { error: "required field(s) missing" });
        return res.json({ error: "required field(s) missing" });
      }

      function getLargestId() {
        let largest = 1;
        if (Object.keys(db).length > 0) {
          Object.values(db).map((arr) => {
            if (arr.length > 0) {
              arr.forEach((obj) => {
                if (parseInt(obj._id) === largest) {
                  largest++;
                }
              });
            }
          });
        }
        return largest;
      }
      let largestID = getLargestId();

      const issue = {
        _id: largestID.toString(),
        issue_title: body.issue_title,
        issue_text: body.issue_text,
        created_on: new Date().toJSON(),
        updated_on: new Date().toJSON(),
        created_by: body.created_by,
        assigned_to: body.assigned_to || "",
        open: true,
        status_text: body.status_text || "",
      };

      if (Object.keys(db).includes(project)) {
        db[project].push(issue);
      } else {
        db[project] = [issue];
      }

      // console.log("Response :", issue);
      return res.json(issue);
    })

    .put(function (req, res) {
      const project = req.params.project;
      const { body } = req;
      // console.log("\nPUT", project, body);

      if (body._id === undefined) {
        // console.log("Response :", { error: "missing _id" });
        return res.json({ error: "missing _id" });
      }

      if (Object.keys(body).length === 1) {
        // console.log("Response :", {
        //   error: "no update field(s) sent",
        //   "_id": body._id,
        // });
        return res.json({ error: "no update field(s) sent", _id: body._id });
      }

      try {
        let issue = db[project].filter(
          (obj) => parseInt(obj._id) === parseInt(body._id)
        )[0];
        issue.updated_on = new Date().toJSON();
        Object.entries(body).forEach((entry) => {
          const key = entry[0];
          const val = entry[1];
          issue[key] = val;
        });
      } catch (e) {
        // console.error(e.message);
        // console.log("Response :", { error: "could not update", "_id": body._id });
        return res.json({ error: "could not update", _id: body._id });
      }

      // console.log("Response :", {
      //   result: "successfully updated",
      //   "_id": body._id,
      // });
      return res.json({ result: "successfully updated", _id: body._id });
    })

    .delete(function (req, res) {
      const project = req.params.project;
      const { body } = req;
      // console.log("\nDELETE", project, body);

      if (body._id === undefined) {
        // console.log("Response :", { error: "missing _id" });
        return res.json({ error: "missing _id" });
      }

      const issue = db[project].filter(
        (obj) => parseInt(obj._id) === parseInt(body._id)
      )[0];
      if (issue === undefined) {
        // console.log("Response :", { error: "could not delete", "_id": body._id });
        return res.json({ error: "could not delete", _id: body._id });
      }

      db[project] = db[project].filter(
        (obj) => parseInt(obj._id) !== parseInt(body._id)
      );

      // console.log("Response :", {
      //   result: "successfully deleted",
      //   "_id": body._id,
      // });
      return res.json({ result: "successfully deleted", _id: body._id });
    });
};
