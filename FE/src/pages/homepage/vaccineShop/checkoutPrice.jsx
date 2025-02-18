import { useEffect } from "react"


function CheckOutPrice() {

  useEffect(() => {
    document.title = "Trang thanh toán";
  }, []);


  return (
    <h1>Check the source</h1>
  )
}

export default CheckOutPrice