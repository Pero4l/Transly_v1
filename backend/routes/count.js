const express = require('express');
const { countAll } = require('../controllers/count.controller');


const router = express.Router();

router.get("/", countAll);

module.exports = router;