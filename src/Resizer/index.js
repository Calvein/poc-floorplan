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
    const { position } = this.props
    const {
      clientX,
      clientY,
    } = this.getClientXY(e)

    this.setState({
      offsetX: clientX - position.x,
      offsetY: clientY - position.y,
    })

    // Hide the draggable "ghost" on desktop
    if (e.dataTransfer) {
      e.dataTransfer.setDragImage(hiddenMask, 0, 0)
    }
  }

  handleDragElement = (e) => {
    const {
      position,
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

    // Prevent weird case at the end of the drag when it would be 0
    if (e.clientX === 0) return

    const x = clientX - (position.x + offsetX)
    const y = clientY - (position.y + offsetY)

    onDrag({
      x,
      y,
    })
  }

  makeHandleDragAnchor = ({ vertical, horizontal }) => (e) => {
    const {
      position,
      onResize,
    } = this.props
    const {
      clientX,
      clientY,
    } = this.getClientXY(e)

    const oldPositions = {
      topLeft: {
        x: position.x,
        y: position.y
      },
      bottomRight: {
        x: position.x + position.width,
        y: position.y + position.height
      },
    };

    const newPositions = {
      topLeft: {
        x: (!horizontal || horizontal === 'right') ? oldPositions.topLeft.x : clientX,
        y: (!vertical || vertical === 'bottom') ? oldPositions.topLeft.y : clientY,
      },
      bottomRight: {
        x: (!horizontal || horizontal === 'left') ? oldPositions.bottomRight.x : clientX,
        y: (!vertical || vertical) === 'top' ? oldPositions.bottomRight.y : clientY,
      },
    }

    // Prevent weird case at the end of the drag when it would be 0
    if (e.clientX === 0) return

    const translate = {
      x: newPositions.topLeft.x - oldPositions.topLeft.x,
      y: newPositions.topLeft.y - oldPositions.topLeft.y,
    }

    const oldWidth = oldPositions.bottomRight.x - oldPositions.topLeft.x
    const oldHeight = oldPositions.bottomRight.y - oldPositions.topLeft.y

    const newWidth = newPositions.bottomRight.x - newPositions.topLeft.x
    const newHeight = newPositions.bottomRight.y - newPositions.topLeft.y

    console.log(oldWidth, newWidth, newPositions, oldPositions);

    const scale = {
      x: newWidth / oldWidth,
      y: newHeight / oldHeight,
    }

    onResize({ translate, scale })
  }

  handleRotate = (e) => {
    const {
      position,
      onRotate,
    } = this.props
    const {
      clientX,
      clientY,
    } = this.getClientXY(e)

    // Prevent weird case at the end of the drag when it would be 0
    if (e.clientX === 0) return

    // @TODO Make a diff of the degress instead of setting a new one
    const x1 = position.x + position.width / 2
    const y1 = position.y + position.height / 2
    const x2 = clientX
    const y2 = clientY

    const rad = Math.atan2(y2 - y1, x2 - x1)
    const deg = (-180 - 45) + rad * 180 / Math.PI

    onRotate({
      deg,
    })
  }

  handleRotateEnd = () => {

  }

  render() {
    const {
      scale,
      position,
    } = this.props

    const wrapperStyle = {
      transform: `scale(${scale})`,
    }

    const containerStyle = {
      width: position.width,
      height: position.height,
      transform: `translate(${position.x}px, ${position.y}px)`,
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
            onDrag={this.handleDragElement}
            onTouchMove={this.handleDragElement}
          />
          <Anchor
            vertical="top"
            horizontal="left"
            makeOnDrag={this.makeHandleDragAnchor}
          />
          <Anchor
            vertical="top"
            makeOnDrag={this.makeHandleDragAnchor}
          />
          <Anchor
            vertical="top"
            horizontal="right"
            makeOnDrag={this.makeHandleDragAnchor}
          />
          <Anchor
            horizontal="right"
            makeOnDrag={this.makeHandleDragAnchor}
          />
          <Anchor
            vertical="bottom"
            horizontal="right"
            makeOnDrag={this.makeHandleDragAnchor}
          />
          <Anchor
            vertical="bottom"
            makeOnDrag={this.makeHandleDragAnchor}
          />
          <Anchor
            vertical="bottom"
            horizontal="left"
            makeOnDrag={this.makeHandleDragAnchor}
          />
          <Anchor
            horizontal="left"
            makeOnDrag={this.makeHandleDragAnchor}
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
  position: PropTypes.shape({
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
  onResize: PropTypes.func.isRequired,
  onRotate: PropTypes.func.isRequired,
}

export default Resizer
