type Props = {
  checked: boolean
  className?: string
  disabled?: boolean
}

const RadioIndicator = ({ checked, className, disabled }: Props) => (
  <div
    className={`relative h-4 w-4 rounded-full border-2 border-solid ${disabled ? 'opacity-50' : ''} ${
      checked
        ? 'border-info after:absolute after:top-1/2 after:left-1/2 after:h-2 after:w-2 after:-translate-x-1/2 after:-translate-y-1/2 after:rounded-full after:bg-info'
        : 'border-passive-1'
    } ${className}`}
  ></div>
)

export default RadioIndicator
