import React from 'react'

const Button = ({onclick, style, text, disabled}) => {
  return (
    <div>
      <button onClick={onclick} className= {style} disabled={disabled}>{text}</button>
    </div>
  )
}

export default Button
