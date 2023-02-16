const chaiHttp = require("chai-http");
const chai = require("chai");
const assert = chai.assert;
const server = require("../server");

chai.use(chaiHttp);

suite("Functional Tests", function () {
  test("Create an issue with every field", (done) => {
    chai
      .request(server)
      .post("/api/issues/project-1")
      .send({
        issue_title: "First Issue",
        issue_text: "this is the first issue",
        created_by: "Sean",
        assigned_to: "Alex",
        status_text: "In QA",
      })
      .end((err, res) => {
        assert.equal(res.status, 200);
        assert.equal(res.body._id, 1);
        assert.equal(res.body.issue_title, "First Issue");
        assert.equal(res.body.issue_text, "this is the first issue");
        assert.isString(res.body.created_on);
        assert.isString(res.body.updated_on);
        assert.equal(res.body.created_by, "Sean");
        assert.equal(res.body.assigned_to, "Alex");
        assert.isTrue(res.body.open);
        assert.equal(res.body.status_text, "In QA");
        // console.log("Res Body :", res.body);
        done();
      });
  });

  test("Create an issue with only required fields", (done) => {
    chai
      .request(server)
      .post("/api/issues/project-1")
      .send({
        issue_title: "Second Issue",
        issue_text: "this is the second issue",
        created_by: "Sean",
      })
      .end((err, res) => {
        assert.equal(res.status, 200);
        assert.equal(res.body._id, 2);
        assert.equal(res.body.issue_title, "Second Issue");
        assert.equal(res.body.issue_text, "this is the second issue");
        assert.isString(res.body.created_on);
        assert.isString(res.body.updated_on);
        assert.equal(res.body.created_by, "Sean");
        assert.isString(res.body.assigned_to);
        assert.isTrue(res.body.open);
        assert.isString(res.body.status_text);
        // console.log("Res Body :", res.body);
        done();
      });
  });

  test("Create an issue with missing required fields", (done) => {
    chai
      .request(server)
      .post("/api/issues/project-1")
      .send({
        issue_text: "this is the issue",
        created_by: "Sean",
      })
      .end((err, res) => {
        assert.equal(res.body.error, "required field(s) missing");
        // console.log("Res Body :", res.body);
        done();
      });
  });

  test("View issues on a project", (done) => {
    chai
      .request(server)
      .get("/api/issues/project-1")
      .end((err, res) => {
        assert.equal(res.status, 200);
        assert.isArray(res.body);
        // console.log("Res Body :", res.body);
        done();
      });
  });

  test("View issues on a project with one filter", (done) => {
    chai
      .request(server)
      .get("/api/issues/project-1?open=true")
      .end((err, res) => {
        assert.equal(res.status, 200);
        assert.isArray(res.body);
        // console.log("Res Body :", res.body);
        done();
      });
  });

  test("View issues on a project with multiple filters", (done) => {
    chai
      .request(server)
      .get("/api/issues/project-1?open=true&created_by=Sean")
      .end((err, res) => {
        assert.equal(res.status, 200);
        assert.isArray(res.body);
        // console.log("Res Body :", res.body);
        done();
      });
  });

  test("Update one field on an issue", (done) => {
    chai
      .request(server)
      .put("/api/issues/project-1")
      .send({
        _id: 1,
        open: false,
      })
      .end((err, res) => {
        assert.equal(res.status, 200);
        assert.equal(res.body.result, "successfully updated");
        assert.equal(res.body._id, 1);
        // console.log("Res Body :", res.body);
        done();
      });
  });

  test("Update multiple fields on an issue", (done) => {
    chai
      .request(server)
      .put("/api/issues/project-1")
      .send({
        _id: 1,
        open: true,
        issue_text: "this is the first issue (updated)",
      })
      .end((err, res) => {
        assert.equal(res.status, 200);
        assert.equal(res.body.result, "successfully updated");
        assert.equal(res.body._id, 1);
        // console.log("Res Body :", res.body);
        done();
      });
  });

  test("Update an issue with missing _id", (done) => {
    chai
      .request(server)
      .put("/api/issues/project-1")
      .send({
        open: false,
      })
      .end((err, res) => {
        assert.equal(res.body.error, "missing _id");
        // console.log("Res Body :", res.body);
        done();
      });
  });

  test("Update an issue with no fields to update", (done) => {
    chai
      .request(server)
      .put("/api/issues/project-1")
      .send({
        _id: 2,
      })
      .end((err, res) => {
        assert.equal(res.body.error, "no update field(s) sent");
        assert.equal(res.body._id, 2);
        // console.log("Res Body :", res.body);
        done();
      });
  });

  test("Update an issue with an invalid _id", (done) => {
    chai
      .request(server)
      .put("/api/issues/project-1")
      .send({
        _id: 3,
        open: false,
      })
      .end((err, res) => {
        assert.equal(res.body.error, "could not update");
        assert.equal(res.body._id, 3);
        // console.log("Res Body :", res.body);
        done();
      });
  });

  test("Delete an issue", (done) => {
    chai
      .request(server)
      .delete("/api/issues/project-1")
      .send({
        _id: 2,
      })
      .end((err, res) => {
        assert.equal(res.status, 200);
        assert.equal(res.body.result, "successfully deleted");
        assert.equal(res.body._id, 2);
        // console.log("Res Body :", res.body);
        done();
      });
  });

  test("Delete an issue with an invalid _id", (done) => {
    chai
      .request(server)
      .delete("/api/issues/project-1")
      .send({
        _id: 3,
      })
      .end((err, res) => {
        assert.equal(res.body.error, "could not delete");
        assert.equal(res.body._id, 3);
        // console.log("Res Body :", res.body);
        done();
      });
  });

  test("Delete an issue with missing _id", (done) => {
    chai
      .request(server)
      .delete("/api/issues/project-1")
      //   .send({})
      .end((err, res) => {
        assert.equal(res.body.error, "missing _id");
        // console.log("Res Body :", res.body);
        done();
      });
  });
});
