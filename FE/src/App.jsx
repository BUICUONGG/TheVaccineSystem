import { useState } from "react"

function App(){
// Tính số lần bấm
// tạo biến count là 1 state có tác dụng re-render trên browser (update value đã thay đổi trên biến) 
let [count,setCount] = useState(0);
const handleCount = () => {
  setCount(count + 1)
}

return <div> <h1>{count}</h1>
<button onClick={handleCount}>Button</button></div>

}

export default App