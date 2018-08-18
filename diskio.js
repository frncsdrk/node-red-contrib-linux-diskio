module.exports = function (RED) {
  const si = require('systeminformation')

  function DiskIoNode (conf) {
    RED.nodes.createNode(this, conf)

    this.name = conf.name

    const node = this

    node.on('input', (msg) => {
      si.disksIO()
        .then(data => {
          let payloadArr = []
          payloadArr.push({
            payload: data.rIO_sec,
            topic: 'diskio_read_sec'
          })
          payloadArr.push({
            payload: data.wIO_sec,
            topic: 'diskio_write_sec'
          })
          node.send([ payloadArr ])
        })
        .catch(err => {
          node.error('SI diskdIO Error', err.message)
        })
    })
  }

  RED.nodes.registerType('diskio', DiskIoNode)
}
