import React, { Component } from 'react'
import PropTypes from 'prop-types'

import './index.css'

class Toolbar extends Component {
  render() {
    const {
      hasElementsSelected,
      hasMultipleElementsSelected,
      isGridShown,
      onAddElement,
      onDuplicateElements,
      onToggleGrid,
      onSnapOnGrid,
      makeOnAlignElements,
    } = this.props

    return (
      <div className="Toolbar">
        <button onClick={onAddElement}>
          Add rect
        </button>
        <button
          disabled={!hasElementsSelected}
          onClick={onDuplicateElements}
        >
          Duplicate
        </button>
        <button onClick={onToggleGrid}>
          {isGridShown ? 'Hide' : 'Show'} grid
        </button>
        <button
          disabled={!hasElementsSelected}
          onClick={onSnapOnGrid}
        >
          Snap on grid
        </button>
        <button
          disabled={!hasMultipleElementsSelected}
          onClick={makeOnAlignElements('top')}
        >
          Align top
        </button>
        <button
          disabled={!hasMultipleElementsSelected}
          onClick={makeOnAlignElements('left')}
        >
          Align left
        </button>
        <button
          disabled={!hasMultipleElementsSelected}
          onClick={makeOnAlignElements('bottom')}
        >
          Align Bottom
        </button>
        <button
          disabled={!hasMultipleElementsSelected}
          onClick={makeOnAlignElements('right')}
        >
          Align Right
        </button>
        <button
          disabled={!hasMultipleElementsSelected}
          onClick={makeOnAlignElements('center-x')}
        >
          Align Center X
        </button>
        <button
          disabled={!hasMultipleElementsSelected}
          onClick={makeOnAlignElements('center-y')}
        >
          Align Center Y
        </button>
      </div>
    )
  }
}

Toolbar.propTypes = {
  hasElementsSelected: PropTypes.bool.isRequired,
  hasMultipleElementsSelected: PropTypes.bool.isRequired,
  isGridShown: PropTypes.bool.isRequired,
  onAddElement: PropTypes.func.isRequired,
  onDuplicateElements: PropTypes.func.isRequired,
  onToggleGrid: PropTypes.func.isRequired,
  onSnapOnGrid: PropTypes.func.isRequired,
  makeOnAlignElements: PropTypes.func.isRequired,
}

export default Toolbar
