import * as React from "react"
import { cn } from "@/lib/utils"

const RadioGroupContext = React.createContext(null)

const RadioGroup = React.forwardRef(({ className, value, onValueChange, name, ...props }, ref) => {
  const defaultName = React.useId()
  return (
    <RadioGroupContext.Provider value={{ value, onValueChange, name: name || defaultName }}>
      <div
        className={cn("grid gap-2", className)}
        {...props}
        ref={ref}
        role="radiogroup"
      />
    </RadioGroupContext.Provider>
  )
})
RadioGroup.displayName = "RadioGroup"

const RadioGroupItem = React.forwardRef(({ className, value, id, ...props }, ref) => {
  const context = React.useContext(RadioGroupContext)
  if (!context) {
    throw new Error("RadioGroupItem must be used within a RadioGroup")
  }
  
  const checked = context.value === value

  return (
    <input
      type="radio"
      id={id}
      value={value}
      checked={checked}
      onChange={() => context.onValueChange(value)}
      name={context.name}
      className={cn(
        "aspect-square h-4 w-4 rounded-full border border-primary text-primary ring-offset-background focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 appearance-none cursor-pointer relative",
        checked && "bg-primary before:content-[''] before:absolute before:inset-0 before:m-auto before:h-2 before:w-2 before:rounded-full before:bg-primary-foreground",
        className
      )}
      ref={ref}
      {...props}
    />
  )
})
RadioGroupItem.displayName = "RadioGroupItem"

export { RadioGroup, RadioGroupItem }
