// This is a generated file.
;((modules)=>{

const instances = {}
const require = (key)=>{
  if (instances[key])
    return instances[key].exports

  const module = {exports:{}}
  modules[key](module, require)
  instances[key] = module
  return module.exports
}

require('/photos/index.js')

})({
"/photos/index.js":(module, require)=>{
const photosElement = document.querySelector('.photos')
const shuffle = (arr)=>arr
  .reduce((arr, item)=>{
    arr.splice(Math.floor(Math.random() * arr.length), 0, item)
    return arr
  }, [])

fetch('https://picsum.photos/list')
  .then(x=>x.json())
  .then(data=>{
    shuffle(data).slice(0,90).forEach(({id}, index)=>{
      const img = document.createElement('img')
      img.src = `https://picsum.photos/200/200?image=${id}&nocache=${Date.now()}`
      img.onload = ()=>{
        photosElement.appendChild(img)
      }
    })
  })

}
});