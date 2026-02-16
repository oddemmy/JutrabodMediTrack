import React from 'react'

const Input = ({className, type, change, name,  placeholder}) => {
  return (
    <div>
      <input name={name} onChange={change} className= {className} placeholder= {placeholder} type={type}/>
    </div>
  )
}

export default Input
