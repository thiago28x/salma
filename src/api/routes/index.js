const express = require('express')
const router = express.Router()


const instanceRoutes = require('./instance.route')
const messageRoutes = require('./message.route')
const miscRoutes = require('./misc.route')
const groupRoutes = require('./group.route')



router.get('/status', (req, res) => res.send('OK'))
router.use('/instance', instanceRoutes)
router.use('/message', messageRoutes)
router.use('/group', groupRoutes)
router.use('/misc', miscRoutes)

// Import path module
const path = require('path');


// Route to serve the start page
router.get('/start', (req, res) => {
    res.sendFile(path.join(__dirname, 'api/views/start.html'));
  });





module.exports = router
