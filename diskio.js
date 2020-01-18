module.exports = function (RED) {
  const si = require('systeminformation')

  function aggregatePayloads (possiblePayloads, payloadArr) {
    for (let i = 0; i < possiblePayloads.length; i++) {
      const possiblePayloadsItem = possiblePayloads[i]
      if (possiblePayloadsItem.condition) {
        payloadArr.push(possiblePayloadsItem.result)
      }
    }

    return payloadArr
  }


  function DiskIoNode (conf) {
    RED.nodes.createNode(this, conf)

    this.name = conf.name

    const node = this

    this.readIOsSec = (typeof conf.readIOsSec  === 'undefined') ? true : conf.readIOsSec
    this.writeIOsSec = (typeof conf.writeIOsSec  === 'undefined') ? true : conf.writeIOsSec

    node.on('input', (msg, send, done) => {
      send = send || function() { node.send.apply(node, arguments) }
      si.disksIO()
        .then(data => {
          let payloadArr = []
          payloadArr = this.calculatePayloads(data, payloadArr)
          send([ payloadArr ])
          if (done) {
            done()
          }
        })
        .catch(err => {
          if (done) {
            done(err)
          } else {
            node.error('SI diskIO Error', err.message)
          }
        })
    })
  }

  DiskIoNode.prototype.calculatePayloads = function (data, payloadArr) {
    const possiblePayloads = [
      {
        condition: this.readIOsSec,
        result: {
          payload: data.rIO_sec,
          topic: 'diskio_read_sec'
        }
      },
      {
        condition: this.writeIOsSec,
        result: {
          payload: data.wIO_sec,
          topic: 'diskio_write_sec'
        }
      }
    ]

    return aggregatePayloads(possiblePayloads, payloadArr)
  }

  RED.nodes.registerType('diskio', DiskIoNode)
}
