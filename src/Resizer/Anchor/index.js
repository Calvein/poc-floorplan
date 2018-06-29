import React, { Component } from 'react'
import PropTypes from 'prop-types'
import classnames from 'classnames'

import './index.css'

// Used to prevent to have a dragging "ghost"
const hiddenMask = new Image()
hiddenMask.src = 'data:image/gif;base64,R0lGODlhAQABAIAAAAUEBAAAACwAAAAAAQABAAACAkQBADs='

class ResizerAnchor extends Component {
  handleDragStartAnchor = (e) => {
    // Hide the draggable "ghost" on desktop
    if (e.dataTransfer) {
      e.dataTransfer.setDragImage(hiddenMask, 0, 0)
    }
  }

  render() {
    const {
      vertical,
      horizontal,
      isRotation,
      onDragStart,
      onDrag,
      makeOnDrag,
    } = this.props

    return (
      <div
        className={classnames(
          'ResizerAnchor',
          { [`ResizerAnchor-${vertical}`]: vertical },
          { [`ResizerAnchor-${horizontal}`]: horizontal },
          { 'ResizerAnchor-rotation': isRotation },
        )}
        draggable
        onDragStart={onDragStart ? onDragStart : this.handleDragStartAnchor}
        onTouchStart={onDragStart ? onDragStart : this.handleDragStartAnchor}
        onDrag={onDrag ? onDrag : makeOnDrag({ vertical, horizontal })}
        onTouchMove={onDrag ? onDrag : makeOnDrag({ vertical, horizontal })}
      />
    )
  }
}

ResizerAnchor.propTypes = {
  vertical: PropTypes.oneOf([
    'top',
    'bottom',
  ]),
  horizontal: PropTypes.oneOf([
    'left',
    'right',
  ]),
  isRotation: PropTypes.bool.isRequired,
  makeOnDrag: PropTypes.func,
  onDragStart: PropTypes.func,
  onDrag: PropTypes.func,
}

ResizerAnchor.defaultProps = {
  isRotation: false,
}

export default ResizerAnchor
