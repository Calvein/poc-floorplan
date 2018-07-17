import React, { Component } from 'react'
import PropTypes from 'prop-types'

import Anchor from './Anchor'

import './index.css'

// Used to prevent to have a dragging "ghost"
const hiddenMask = new Image()
hiddenMask.src = 'data:image/gif;base64,R0lGODlhAQABAIAAAAUEBAAAACwAAAAAAQABAAACAkQBADs='

class Resizer extends Component {
  state = {
    offsetX: 0,
    offsetY: 0,
  }

  getClientXY = (e) => {
    const {
      canvasX,
      canvasY,
      scale,
    } = this.props

    return {
      clientX: ((e.touches ? e.touches[0].clientX : e.clientX) - canvasX) / scale,
      clientY: ((e.touches ? e.touches[0].clientY : e.clientY) - canvasY) / scale,
    }
  }

  handleDragElementStart = (e) => {
    const { displayPosition } = this.props
    const {
      clientX,
      clientY,
    } = this.getClientXY(e)

    this.setState({
      offsetX: clientX - displayPosition.x,
      offsetY: clientY - displayPosition.y,
    })

    // Hide the draggable "ghost" on desktop
    if (e.dataTransfer) {
      e.dataTransfer.setDragImage(hiddenMask, 0, 0)
    }
  }

  calculateDragDistance = (e) => {
    const {
      currentPosition,
      onDrag,
    } = this.props
    const {
      offsetX,
      offsetY,
    } = this.state
    const {
      clientX,
      clientY,
    } = this.getClientXY(e)

    const x = clientX - (currentPosition.x + offsetX)
    const y = clientY - (currentPosition.y + offsetY)

    return { x, y };
  }

  handleDragElement = (e) => {
    // Prevent weird case at the end of the drag when it would be 0
    if (e.clientX === 0) return

    this.props.onDrag(this.calculateDragDistance(e))
  }

  handleDragElementEnd = (e) => {
    this.props.onDragEnd(this.calculateDragDistance(e))
  }

  makeHandleDragAnchor = ({ end, vertical, horizontal }) => (e) => {
    const {
      currentPosition,
      onResize,
      onResizeEnd,
    } = this.props
    const {
      clientX,
      clientY,
    } = this.getClientXY(e)

    const oldcurrentPositions = {
      topLeft: {
        x: currentPosition.x,
        y: currentPosition.y
      },
      bottomRight: {
        x: currentPosition.x + currentPosition.width,
        y: currentPosition.y + currentPosition.height
      },
    };

    const newcurrentPositions = {
      topLeft: {
        x: (!horizontal || horizontal === 'right') ? oldcurrentPositions.topLeft.x : clientX,
        y: (!vertical || vertical === 'bottom') ? oldcurrentPositions.topLeft.y : clientY,
      },
      bottomRight: {
        x: (!horizontal || horizontal === 'left') ? oldcurrentPositions.bottomRight.x : clientX,
        y: (!vertical || vertical) === 'top' ? oldcurrentPositions.bottomRight.y : clientY,
      },
    }

    // Prevent weird case at the end of the drag when it would be 0
    if (e.clientX === 0) return

    const translate = {
      x: newcurrentPositions.topLeft.x - oldcurrentPositions.topLeft.x,
      y: newcurrentPositions.topLeft.y - oldcurrentPositions.topLeft.y,
    }

    const oldWidth = oldcurrentPositions.bottomRight.x - oldcurrentPositions.topLeft.x
    const oldHeight = oldcurrentPositions.bottomRight.y - oldcurrentPositions.topLeft.y

    const newWidth = newcurrentPositions.bottomRight.x - newcurrentPositions.topLeft.x
    const newHeight = newcurrentPositions.bottomRight.y - newcurrentPositions.topLeft.y

    const scale = {
      x: newWidth / oldWidth,
      y: newHeight / oldHeight,
    }

    const onChange = end ? onResizeEnd : onResize;

    onChange({ translate, scale })
  }

  calculateRotation = (e) => {
    const {
      currentPosition,
    } = this.props
    const {
      clientX,
      clientY,
    } = this.getClientXY(e)

    // @TODO Make a diff of the degress instead of setting a new one
    const x1 = currentPosition.x + currentPosition.width / 2
    const y1 = currentPosition.y + currentPosition.height / 2
    const x2 = clientX
    const y2 = clientY

    const rad = Math.atan2(y2 - y1, x2 - x1)
    const deg = (-180 - 45) + rad * 180 / Math.PI

    return deg;
  }

  handleRotate = (e) => {
    // Prevent weird case at the end of the drag when it would be 0
    if (e.clientX === 0) return

    this.props.onRotate({ deg: this.calculateRotation(e) })
  }

  handleRotateEnd = (e) => {
    this.props.onRotateEnd({ deg: this.calculateRotation(e) })
  }

  render() {
    const {
      scale,
      displayPosition,
    } = this.props

    const wrapperStyle = {
      transform: `scale(${scale})`,
    }

    const containerStyle = {
      width: displayPosition.width,
      height: displayPosition.height,
      transform: `translate(${displayPosition.x}px, ${displayPosition.y}px)`,
    }

    return (
      <div className="Resizer-wrapper" style={wrapperStyle}>
        <div
          className="Resizer-container"
          style={containerStyle}
        >
          <div
            className="Resizer-draggable"
            draggable
            onDragStart={this.handleDragElementStart}
            onTouchStart={this.handleDragElementStart}
            onTouchEnd={this.handleDragElementEnd}
            onDrag={this.handleDragElement}
            onDragEnd={this.handleDragElementEnd}
            onTouchMove={this.handleDragElement}
          />
          <Anchor
            vertical="top"
            horizontal="left"
            onDrag={this.makeHandleDragAnchor({ vertical: 'top', horizontal: 'left' })}
            onDragEnd={this.makeHandleDragAnchor({ end: true, vertical: 'top', horizontal: 'left' })}
          />
          <Anchor
            vertical="top"
            onDrag={this.makeHandleDragAnchor({ vertical: 'top' })}
            onDragEnd={this.makeHandleDragAnchor({ end: true, vertical: 'top' })}
          />
          <Anchor
            vertical="top"
            horizontal="right"
            onDrag={this.makeHandleDragAnchor({ vertical: 'top', horizontal: 'right' })}
            onDragEnd={this.makeHandleDragAnchor({ end: true, vertical: 'top', horizontal: 'right' })}
          />
          <Anchor
            horizontal="right"
            onDrag={this.makeHandleDragAnchor({ horizontal: 'right' })}
            onDragEnd={this.makeHandleDragAnchor({ end: true, horizontal: 'right' })}
          />
          <Anchor
            vertical="bottom"
            horizontal="right"
            onDrag={this.makeHandleDragAnchor({ vertical: 'bottom', horizontal: 'right' })}
            onDragEnd={this.makeHandleDragAnchor({ end: true, vertical: 'bottom', horizontal: 'right' })}
          />
          <Anchor
            vertical="bottom"
            onDrag={this.makeHandleDragAnchor({ vertical: 'bottom' })}
            onDragEnd={this.makeHandleDragAnchor({ end: true, vertical: 'bottom' })}
          />
          <Anchor
            vertical="bottom"
            horizontal="left"
            onDrag={this.makeHandleDragAnchor({ vertical: 'bottom', horizontal: 'left' })}
            onDragEnd={this.makeHandleDragAnchor({ end: true, vertical: 'bottom', horizontal: 'left' })}
          />
          <Anchor
            horizontal="left"
            onDrag={this.makeHandleDragAnchor({ horizontal: 'left' })}
            onDragEnd={this.makeHandleDragAnchor({ end: true, horizontal: 'left' })}
          />
          <Anchor
            isRotation
            onDrag={this.handleRotate}
            onDragEnd={this.handleRotateEnd}
          />
        </div>
      </div>
    )
  }
}

Resizer.propTypes = {
  scale: PropTypes.number.isRequired,
  displayPosition: PropTypes.shape({
    x: PropTypes.number.isRequired,
    y: PropTypes.number.isRequired,
    width: PropTypes.number.isRequired,
    height: PropTypes.number.isRequired,
  }).isRequired,
  canvasWidth: PropTypes.number.isRequired,
  canvasHeight: PropTypes.number.isRequired,
  canvasX: PropTypes.number.isRequired,
  canvasY: PropTypes.number.isRequired,
  onDrag: PropTypes.func.isRequired,
  onDragEnd: PropTypes.func.isRequired,
  onResize: PropTypes.func.isRequired,
  onRotate: PropTypes.func.isRequired,
  onRotateEnd: PropTypes.func.isRequired,
}

export default Resizer
