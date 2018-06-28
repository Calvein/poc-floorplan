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

  handleDragStart = (e) => {
    const { data } = this.props
    const {
      clientX,
      clientY,
    } = this.getClientXY(e)

    this.setState({
      offsetX: clientX - data.x,
      offsetY: clientY - data.y,
    })

    // Hide the draggable "ghost" on desktop
    if (e.dataTransfer) {
      e.dataTransfer.setDragImage(hiddenMask, 0, 0)
    }
  }

  handleDrag = (e) => {
    const {
      data,
      canvasWidth,
      canvasHeight,
      scale,
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
      width,
      height,
    } = data

    // Prevent weird case at the end of the drag when it would be 0
    if (e.clientX === 0) return

    const x = Math.min(Math.max(0, clientX - offsetX), canvasWidth / scale - width)
    const y = Math.min(Math.max(0, clientY - offsetY), canvasHeight / scale - height)

    onDrag({
      x,
      y,
    })
  }

  makeHandleDragAnchor = ({ vertical, horizontal }) => (e) => {
    const {
      data,
      canvasWidth,
      canvasHeight,
      scale,
      onDrag,
    } = this.props
    const {
      clientX,
      clientY,
    } = this.getClientXY(e)

    // Prevent weird case at the end of the drag when it would be 0
    if (e.clientX === 0) return

    let {
      width,
      height,
      x,
      y,
    } = data

    if (vertical === 'top') {
      y = clientY
      height = data.height + data.y - clientY
    } else if (vertical === 'bottom') {
      height = clientY - data.y
    }

    if (horizontal === 'right') {
      width = clientX  - data.x
    } else if (horizontal === 'left') {
      x = clientX
      width = data.width + data.x - clientX
    }

    // @TODO don't prevent, add min/max instead
    if (x < 0) return
    if (x < 0) return
    if (width < 0) return
    if (height < 0) return
    if (x + width > canvasWidth / scale) return
    if (y + height > canvasHeight / scale) return

    onDrag({
      width,
      height,
      x,
      y,
    })
  }

  handleRotate = () => (e) => {
    const {
      data,
      onDrag,
    } = this.props
    const {
      clientX,
      clientY,
    } = this.getClientXY(e)

    // Prevent weird case at the end of the drag when it would be 0
    if (e.clientX === 0) return

    const x1 = data.x + data.width / 2
    const y1 = data.y + data.height / 2
    const x2 = clientX
    const y2 = clientY
    const rad = Math.atan2(y2 - y1, x2 - x1)
    const deg = (-180 - 45) + rad * 180 / Math.PI

    onDrag({
      deg,
    })
  }

  render() {
    const {
      scale,
      data,
      onClick,
    } = this.props

    const wrapperStyle = {
      transform: `scale(${scale})`,
    }

    const containerStyle = {
      width: data.width,
      height: data.height,
      transform: `translate(${data.x}px, ${data.y}px) rotate(${data.deg}deg)`,
    }

    return (
      <div className="Resizer-wrapper" style={wrapperStyle}>
        <div
          className="Resizer-container"
          style={containerStyle}
          onClick={onClick}
        >
          <div
            className="Resizer-draggable"
            draggable
            onDragStart={this.handleDragStart}
            onTouchStart={this.handleDragStart}
            onDrag={this.handleDrag}
            onTouchMove={this.handleDrag}
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
            makeOnDrag={this.handleRotate}
          />
        </div>
      </div>
    )
  }
}

Resizer.propTypes = {
  scale: PropTypes.number.isRequired,
  data: PropTypes.object.isRequired,
  canvasWidth: PropTypes.number.isRequired,
  canvasHeight: PropTypes.number.isRequired,
  canvasX: PropTypes.number.isRequired,
  canvasY: PropTypes.number.isRequired,
  onDrag: PropTypes.func.isRequired,
  onClick: PropTypes.func.isRequired,
}

export default Resizer
