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
      offsetX: clientX - position.x1,
      offsetY: clientY - position.y1,
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
    const {
      x1,
      y1,
    } = position

    // Prevent weird case at the end of the drag when it would be 0
    if (e.clientX === 0) return

    const x = clientX - (x1 + offsetX)
    const y = clientY - (y1 + offsetY)

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

    let x1 = 0
    let y1 = 0
    let x2 = 0
    let y2 = 0

    // Prevent weird case at the end of the drag when it would be 0
    if (e.clientX === 0) return

    if (vertical === 'top') {
      y1 = clientY - position.y1
      y2 = -y1
    } else if (vertical === 'bottom') {
      y2 = clientY - position.y2
    }

    if (horizontal === 'right') {
      x2 = clientX - position.x2
    } else if (horizontal === 'left') {
      x1 = clientX - position.x1
      x2 = -x1
    }

    // @TODO don't prevent, add min/max instead
    // if (x < 0) return
    // if (x < 0) return
    // if (width < 0) return
    // if (height < 0) return
    // if (x + width > canvasWidth / scale) return
    // if (y + height > canvasHeight / scale) return

    onResize({
      x1,
      y1,
      x2,
      y2,
    })
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
    const x1 = position.x1 + (position.x2 - position.x1) / 2
    const y1 = position.y1 + (position.y2 - position.y1) / 2
    const x2 = clientX
    const y2 = clientY
    const rad = Math.atan2(y2 - y1, x2 - x1)
    const deg = (-180 - 45) + rad * 180 / Math.PI

    onRotate({
      deg,
    })
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
      width: position.x2 - position.x1,
      height: position.y2 - position.y1,
      transform: `translate(${position.x1}px, ${position.y1}px)`,
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
          />
        </div>
      </div>
    )
  }
}

Resizer.propTypes = {
  scale: PropTypes.number.isRequired,
  position: PropTypes.shape({
    x1: PropTypes.number.isRequired,
    y1: PropTypes.number.isRequired,
    x2: PropTypes.number.isRequired,
    y2: PropTypes.number.isRequired,
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
