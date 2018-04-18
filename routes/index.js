'use strict';

const express = require('express');
const router = express.Router();

const passport = require('passport');

/* ==============================
 * React: redirect all requests to the app to let the internal router handle it
 *      TODO: remove all other rendering methods in favor of the react app
 * ============================== */

router.use('/', (req, res, next) => {

  // determine other parameters of a request that might require rendering a view other than the main react app

  return res.render('react');

})

module.exports = router;
