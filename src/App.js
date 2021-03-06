
import detectEthereumProvider from '@metamask/detect-provider';
import Web3 from 'web3';
import './App.css';
import {useState,useEffect} from "react"

function App() {
  const [web3Api,setWeb3Api]= useState({
    provider:null,
    web3:null,
  })

  useEffect(()=>{

    const loadProvider =  async()=>{
      const provider = await detectEthereumProvider();

      if(provider){
        providerChanged(provider);
        setWeb3Api({
          provider,
          web3:new Web3(provider)
        })

      }else{
        window.alert("Please Install Metamask wallet or other")
      }

    }
loadProvider()
  },[])

  const [account,setAccount]= useState(null)
  useEffect( ()=>{
    const loadAccounts =  async ()=>{
      const accounts = await web3Api.web3.eth.getAccounts()
      setAccount(accounts[0])

    }
    web3Api.web3&& loadAccounts()

  },[web3Api.web3])

  const providerChanged = (provider)=>{

    provider.on("accountsChanged",_=>window.location.reload());
    provider.on("chainChanged",_=>window.location.reload());


  }
  //Load Contract
  const[contract,setContract] =useState()
  const[productsCount,setProductsCount] = useState();
  useEffect(()=>{
    const loadContracts = async ()=>{
      const contractFile = await fetch('/abis/Shop.json');
      const convertToJson = await contractFile.json();
      //find the abi
      const abi = convertToJson.abi;

      const netWorkid = await web3Api.web3.eth.net.getId();

      const networkObject = convertToJson.networks[netWorkid];

      if(networkObject){
        const contractAddress = convertToJson.networks[netWorkid].address
        const deployedContract= await  new web3Api.web3.eth.Contract(abi,contractAddress);
          setContract(deployedContract);
        
          const producCount = await deployedContract.methods.count().call()
          setProductsCount(producCount);
        
  
      }else{
        window.alert("Please connect your wallet with Ganache")
      }




    }
    web3Api.web3 &&loadContracts();
  },[web3Api.web3])
  const [productInputs,setProductInputs]=useState({
    name:"",price:"",description:""
  })
  //Add Product
    const addProduct =  async()=>{

      const value = productInputs.price


      const converTowei = Web3.utils.toWei(value,"ether")
      if(productInputs.name&&converTowei&&productInputs.description) {
        const addProduct  = await contract.methods.createShopProduct(productInputs.name,converTowei,productInputs.description).send({from:account});

        window.location.reload();
 
      }else {
        window.alert("Please fill all inputs")
      }


    }
    
const [products,setLoadedProducts] = useState([]);
    useEffect(()=>{
      const loadProducts =  async()=>{

        for(let i =0;i <productsCount;i++){
          const product = await contract.methods.shopProducts(i).call()
          setLoadedProducts(products=>[products,product])
        }

      }
      account&& loadProducts();

    },[account,web3Api.web3])
 


  return (
    <div className="App">
      <nav className="navbar navbar-dark bg-dark">
  <div className="container-fluid">
    <a className="navbar-brand">MrBebo Shop</a>
    <form className="d-flex">
      <button className="btn btn-outline-success" >{account}</button>
    </form>
  </div>
</nav>
<div className = "mainPart">
  <h1>{productsCount}</h1>
  <h1>Add your Product to Buy it</h1>

  <div className ="Productinputs container">
  <div className="input-group mb-3">
  <span className="input-group-text" id="inputGroup-sizing-default">Product Name</span>
  <input type="text" className="form-control" aria-label="Sizing example input" aria-describedby="inputGroup-sizing-default"  onChange = {e=>setProductInputs({...productInputs,name:e.target.value})}/>
</div>

<div className="input-group mb-3">
  <span className="input-group-text">Enter Ether Value</span>
  <input type="text" className="form-control" aria-label="Amount (to the nearest dollar)" onChange = {e=>setProductInputs({...productInputs,price:e.target.value})}/>
  <span className="input-group-text">ETH</span>
</div>
<div className="input-group">
  <span className="input-group-text">Product Description</span>
  <textarea className="form-control" aria-label="With textarea" onChange = {e=>setProductInputs({...productInputs,description:e.target.value})}></textarea>
</div>
<button type="button " className="btn btn-success p-2 m-3" onClick={addProduct}>Add Products</button>

  </div>
</div>

{
  products.map((item,index)=>{
    return(  
      <> 
    <h1>{item.price}</h1>
    <h1>{item.name}</h1>
    <h1>{item.description}</h1>


    </>
    )
   
  

  })
}
      
    </div>
  );
}

export default App;
