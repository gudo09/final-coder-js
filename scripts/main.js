//--------------------------- DECLARO LA URL DE LA POKEAPI DE MANERA GLOBAL
const url = "https://pokeapi.co/api/v2";

let pokedexCompleta = [];
let listaFavoritos = [];

/*
  FALTA IMPLEMENTAR:
  ✅- MOSTRAR MENSAJE DE QUE NO SE ENCONTRO NADA CON LA BÚSQUEDA
  ✅- FILTRAR POR ID 
  ✅- BOTON DE FAVORITOS
  ✅- ALMACENAR FAVORITOS EN EL LOCAL STORAGE
  ✅- FILTRAR POR FAVORITOS
  - FILTRAR POR TIPOS
  - MOSTRAR POKEMON ALEATORIO (SOLO PARA PROYECTO FINAL)
  ✅- VALIDAR FORMULARIOS
*/


start();
async function start () {
  await conectarLocalStorage();

  iniciarPokedex();

  formularioBuscar();
}

//MAQUETO LA BARRA DE HERRAMIENTAS PARA BUSCAR
const divTools = document.querySelector('#tools');
divTools.setAttribute('class', 'py-4 mx-8 flex flex-col');


async function conectarLocalStorage(){
  const apiResponse = await getPokemonQuery("?limit=100000&offset=0");

  if (localStorage.getItem( 'pokedexCompleta' ) === JSON.stringify(apiResponse) && localStorage.getItem( 'pokedexCompleta' ) ) {
    pokedexCompleta = JSON.parse( localStorage.getItem('pokedexCompleta' ));
  }else{
    localStorage.removeItem('pokedexCompleta');
    pokedexCompleta = apiResponse;
    localStorage.setItem( 'pokedexCompleta', JSON.stringify(pokedexCompleta ));
  }


  if (localStorage.getItem('listaFavoritos') !== null) {
    listaFavoritos = JSON.parse(localStorage.getItem('listaFavoritos'));
    //console.log(listaFavoritos);
  } else {
    localStorage.setItem( 'listaFavoritos', JSON.stringify(listaFavoritos ));

  }
}

async function iniciarPokedex(){
  maquetarPaginacion(pokedexCompleta);
  const pokedexInicial = await getPokemonQuery("?offset=0&limit=20");
  await refrescarPokedex(pokedexInicial);
}

async function cargando(){
  const $modal = document.querySelector('#modal');
  const $loadSpinner = `<div class="inline-block h-20 w-20 animate-spin rounded-full border-8 border-solid border-red-500 border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite] "role="status"> </div>`;
  $modal.classList.remove('hidden');
  $modal.innerHTML = $loadSpinner;
}

async function ocultarCargando(){
  const $modal = document.querySelector('#modal');
  $modal.classList.add('hidden');
}

async function refrescarPokedex(listado){
  try {
    cargando();
    let pokedexHTML = document.querySelector('#pokedex');
    pokedexHTML.innerHTML = "";
    
    for (const pokemon of listado) {
      const card = await crearCard(pokemon);
      pokedexHTML.appendChild(card);
    }

    ocultarCargando();

  } catch (error) {
    console.log('Error al generar la card');
    console.error(error);
  }
}

async function crearCard(pokemon) {
  const datosPokemon = await getPokemonData(pokemon.url);

  //INICIALIZO LA CARD DEL POKEMON
  const card = document.createElement('li');
  card.setAttribute("class","card-pokemon");

  //PARTE SUPERIOR DE LA CARD DEL POKEMON
  const cardSuperior = document.createElement('div');
  cardSuperior.setAttribute("class","card-pokemon-superior");
  cardSuperior.appendChild(maquetarIDPokedex(datosPokemon));
  cardSuperior.appendChild(maquetarFavoritoCard(datosPokemon));
  card.appendChild(cardSuperior);

  //PARTE MEDIA DE LA CARD DEL POKEMON
  const cardMedia = document.createElement('div');
  cardMedia.appendChild(maquetarImagenPokedex(datosPokemon));
  cardMedia.appendChild(await maquetarNombrePokedex(datosPokemon));
  cardMedia.appendChild(await maquetarTiposPokedex(datosPokemon));
  cardMedia.appendChild(await maquetarHabilidadesPokedex(datosPokemon));
  cardMedia.setAttribute("class","card-pokemon-media");
  card.appendChild(cardMedia);

  //PARTE INFERIOR DE LA CARD DEL POKEMON
  const cardInferior = document.createElement('div');
  cardInferior.setAttribute("class","card-pokemon-inferior");
  cardInferior.appendChild(maquetarEstadisticasPokedex(datosPokemon));

  card.appendChild(cardInferior);
  console.log(pokemon.name);

  return card;
}

function traducirEstadisticasEspanol(estadistica) {
  switch (estadistica) {
    case "hp":
      return "PS"
    case "attack":
      return "Ataque"
    case "defense":
      return "Defensa"
    case "special-attack":
      return "Ataque especial"
    case "special-defense":
      return "Defensa especial"
    case "speed":
      return "Velocidad"
    default:
      break;
  }
}
    
function buscador(valorBuscado, filtro){
  let resultadoBusqueda = [];
  let listado = [];

  document.querySelector('.checkbox-favoritos').checked
    ? listado = listaFavoritos
    : listado = pokedexCompleta;

  filtro === "nombre" 
    ? resultadoBusqueda = listado.filter( pokemon => pokemon.name.includes(valorBuscado.toLowerCase().trim()) )
    : resultadoBusqueda = listado.filter( pokemon => pokemon.url === `https://pokeapi.co/api/v2/pokemon/${valorBuscado}/` );
  
  if (resultadoBusqueda.length === 0) {
    Swal.fire({
      title: `No se encontraron resultados con el ${filtro === "id" ? 'ID': filtro} ${valorBuscado}${ listado === listaFavoritos ? " dentro de tus favoritos." : ""}`,
      icon: "error"
    });

    document.querySelector('#formBuscar').querySelectorAll('input').forEach( input => input.value = '');
    document.querySelector('.checkbox-favoritos').checked = false;
    iniciarPokedex();
  } else {
    refrescarPokedex(resultadoBusqueda);
    esconderpaginacion();
  }
}

function formularioBuscar() {
  //CREAR FORMULARIO BUSQUEDA
  const divTools = document.querySelector('#tools');
  
  const formBuscar = document.createElement('form');
  divTools.appendChild(formBuscar);
  formBuscar.setAttribute('class', 'form-buscar' );
  formBuscar.setAttribute('id', 'formBuscar')

  //--------------------------------------------PREVENGO EL ENVIO DE DATOS DEL FORMULARIO
  formBuscar.addEventListener('submit', (e) =>{
    e.preventDefault();
  });
  
  //----------------------------------CREO TODOS LOS ELEMENTOS NECESARIOS PARA EL FORMULARIO
  const lblBuscarNombre = document.createElement('label');
  formBuscar.appendChild(lblBuscarNombre);
  const inputBuscarNombre = document.createElement('input');
  inputBuscarNombre.setAttribute('class', 'input-nombre');
  formBuscar.appendChild(inputBuscarNombre);
  const lblBuscarID = document.createElement('label');
  formBuscar.appendChild(lblBuscarID);
  const inputBuscarID = document.createElement('input');
  inputBuscarID.setAttribute('class', 'input-id');
  formBuscar.appendChild(inputBuscarID);
  
  //--------------------------------- LABEL E INPUT BUSCAR POR NOMBRE -------------------------------
  lblBuscarNombre.textContent = `Nombre del pokemon`;
  
  //--------------------------EVENTO CHANGE PARA MOSTRAR RESULTADOS--------------------------
  inputBuscarNombre.addEventListener('keypress',(e) => {
    if (e.key === 'Enter') {
    e.target.value === "" 
      ? iniciarPokedex()
      : buscador(e.target.value, "nombre");
    }
  });

  //--------------------------BLANQUEO EL INPUT ID SI HAGO FOCO--------------------------
  inputBuscarNombre.addEventListener('focus',(e) => {
    inputBuscarID.value = "";
  });

  //--------------------------------- LABEL Y BOTON BUSCAR POR ID -------------------------------
  lblBuscarID.textContent = `ID del pokemon`;
  inputBuscarID.setAttribute("type", "number");
  inputBuscarID.setAttribute("min", 1);
  inputBuscarID.setAttribute("placeholder", "Sólo números");
  inputBuscarID.setAttribute("size", 4);

  //--------------------------REFRESCO CON EL EVENTO INPUT--------------------------
  inputBuscarID.addEventListener('input', (e) => {
    e.target.value === "" ? iniciarPokedex() : buscador(e.target.value, "id"); 
  });

  //--------------------------BLANQUEO EL INPUT NOMBRE SI HAGO FOCO--------------------------
  inputBuscarID.addEventListener('focus',(e) => {
    inputBuscarNombre.value = "";
  });

  const $lblFavoritos = document.createElement("label");
  $lblFavoritos.textContent = "Mostrar sólo favoritos";
  const $checkSoloFavoritos = document.createElement("input");
  $checkSoloFavoritos.setAttribute("type", "checkbox");
  $checkSoloFavoritos.setAttribute('class', 'checkbox-favoritos');
  formBuscar.appendChild($lblFavoritos);
  formBuscar.appendChild($checkSoloFavoritos);

  $checkSoloFavoritos.addEventListener('click',(e) => {
    

    if(inputBuscarNombre.value === "" && inputBuscarID.value === "") {
      if (e.target.checked) {

        if(listaFavoritos.length === 0) {
          Swal.fire({
            title: `No posees ningún pokémon marcado como favorito`,
            icon: "error"
          });
          document.querySelector('#formBuscar').querySelectorAll('input').forEach( input => input.value = '');
          e.target.checked = false;
          iniciarPokedex();
        }else{
          esconderpaginacion();
          refrescarPokedex(listaFavoritos);
        }

      } else { iniciarPokedex(pokedexCompleta) }
    }

    if(inputBuscarNombre.value !== "" ) { buscador(inputBuscarNombre.value, "nombre"); }
    if(inputBuscarID.value !== "" ) { buscador(inputBuscarID.value, "id"); }
  });
}

function maquetarImagenPokedex(pokemon) {
  //CREO UNA ETIQUETA <img> QUE CONTENGA LA IMAGEN DE FONDO
  const divImagen = document.createElement('div');
  divImagen.setAttribute("class","fondo-pokebola");

  //CREO UNA ETIQUETA <img> PARA LA IMAGEN DEL POKEMON
  const imagen = document.createElement('img');
  imagen.setAttribute("src",`${pokemon.sprites.other["official-artwork"].front_default ? pokemon.sprites.other["official-artwork"].front_default : "../assets/images/missing.png"}`);
  pokemon.sprites.other["official-artwork"].front_default === null ? imagen.setAttribute("class","w-32 h-32 my-auto") : imagen.setAttribute("class","img-pokemon");
  
  divImagen.appendChild(imagen);

  return divImagen;
}

async function maquetarNombrePokedex(pokemon) {
  try {
    //CREO UNA ETIQUETA <div> PARA QUE MUESTRE EL NOMBRE DEL POKEMON
    const pNombre = document.createElement('p');
    pNombre.setAttribute("class", "nombre-pokemon");
    pNombre.textContent = await traducirNombre(pokemon.species.url);
    
    return pNombre  
  } catch (error) {
    console.log('Error al maquetar nombre');
    console.error(error);
  }
}

function maquetarIDPokedex(pokemon) {
  //CREO UNA ETIQUETA <p> PARA EL ID DEL POKEMON
  const numeroPokedex = document.createElement('p');
  numeroPokedex.setAttribute("class","id-pokemon");
  numeroPokedex.textContent = `N° pokédex: #${pokemon.id}`;

  return numeroPokedex;
}

function maquetarFavoritoCard(pokemon) {
  const $botonFavoritoCard = document.createElement('input');
  //$botonFavoritoCard.setAttribute("type","image");
  $botonFavoritoCard.setAttribute("type","image");
  $botonFavoritoCard.setAttribute("class",`boton-favorito boton-favorito-${pokemon.id}`);

  !listaFavoritos.some(x => x.id == pokemon.id)
    ? $botonFavoritoCard.src = "./assets/images/heart.svg"
    : $botonFavoritoCard.src = "./assets/images/heart-fill.svg"

  $botonFavoritoCard.addEventListener("click", (e) => {
    if (e.target.getAttribute("src") === "./assets/images/heart.svg") {
      agregarFavorito(pokemon);
      e.target.setAttribute("src","./assets/images/heart-fill.svg");
    } else {
      eliminarFavorito(pokemon);
      e.target.setAttribute("src","./assets/images/heart.svg");
    }
  });
  return $botonFavoritoCard;
}

function agregarFavorito(pokemon) {
  if (! listaFavoritos.some(x => x.id === pokemon.id) || listaFavoritos.length === 0) {
    const fav = {id: pokemon.id, name: pokemon.name, url: `${url}/pokemon/${pokemon.id}/`};
    listaFavoritos.push(fav);
    listaFavoritos.sort( (a, b) => a.id - b.id)
    console.log(listaFavoritos);
    localStorage.setItem('listaFavoritos', JSON.stringify(listaFavoritos));
    
    Toastify({
      text: `${pokemon.name} agregado a favoritos`,
      style: {
        background: "linear-gradient(90deg, rgba(150,215,102,1) 0%, rgba(82,212,127,1) 100%)",
      },
      duration: 1500
    }).showToast();
  }

}

function eliminarFavorito(pokemon) {
  const resultado = listaFavoritos.findIndex(x => x.id === pokemon.id);
  listaFavoritos.splice(resultado,1)

  localStorage.setItem('listaFavoritos', JSON.stringify(listaFavoritos));

  Toastify({
    text: `${pokemon.name} eliminado de favoritos`,
    style: {
      background: "linear-gradient(90deg, rgba(230,41,41,1) 0%, rgba(217,83,71,1) 100%)",
    },
    duration: 1500
  }).showToast();

  const inputBuscarNombre = document.querySelector('.input-nombre');
  const inputBuscarID = document.querySelector('.input-id');
  const checkFavoritos = document.querySelector('.checkbox-favoritos');

  if (checkFavoritos.checked && inputBuscarNombre.value !== "") { buscador(inputBuscarNombre.value, "nombre"); }

  if (checkFavoritos.checked && inputBuscarID.value !== "") { buscador(inputBuscarID.value, "id"); }
}

async function maquetarTiposPokedex(pokemon) {
  try {
    //CREO UNA ETIQUETA <div> PARA QUE MUESTRE LOS TIPOS DEL POKEMON
    const divTipos = document.createElement('div');
    divTipos.setAttribute("class", "tipos-container");
  
    for (const type of pokemon.types) {
      //CREO UNA ETIQUETA <p> PARA EL MUESTRE EL TIPO1 DEL POKEMON
      const tipo = document.createElement('div');
      tipo.setAttribute("class", `tipo-pokemon tipo-pokemon-${type.type.name}`);
      
      const tipoTexto = document.createElement('p');
      tipoTexto.textContent = await traducirTipo(type.type.url);
      tipoTexto.setAttribute("class", "tipo-pokemon-texto");
      tipo.appendChild(tipoTexto);
  
      divTipos.appendChild(tipo);
    }
    
    return divTipos;
  } catch (error) {
    console.log('Error al maquetar tipos');
    console.error(error);
  }
}

async function maquetarHabilidadesPokedex(pokemon) {
  try {
    //CREO UNA ETIQUETA <div> PARA QUE MUESTRE LAS HABILIDADES DEL POKEMON
    const ulHabilidades = document.createElement('ul');
    ulHabilidades.setAttribute("class", "habilidades-container");

    for (const h of pokemon.abilities) {
      const liHabilidad = document.createElement('li');
      //CREO UNA ETIQUETA <label> PARA LAS HABILIDADES DEL POKEMON
      const labelHabilidad = document.createElement('label');
      h.is_hidden
        ?labelHabilidad.textContent = `Habilidad oculta: `
        :labelHabilidad.textContent = `Habilidad ${h.slot}: `;
      liHabilidad.appendChild(labelHabilidad);
      
      //CREO UNA ETIQUETA <p> PARA EL MOSTRAR LAS HABILIDADES DEL POKEMON
      const habilidad = document.createElement('p');
      habilidad.textContent = await traducirHabilidad(h.ability.url);
      liHabilidad.appendChild(habilidad);
  
      ulHabilidades.appendChild(liHabilidad);
    }
    return ulHabilidades;
    
  } catch (error) {
    console.log('Error al maquetar habilidades del pokemon');
    console.error(error);
  }
}

function maquetarEstadisticasPokedex(pokemon) {
  const divRespuesta = document.createElement('ul');
  //CREO UNA ETIQUETA <p> QUE DIGA ESTADISTICAS
  const tituloEstadisticas = document.createElement('h3');
  tituloEstadisticas.textContent = "Estadísticas";
  divRespuesta.appendChild(tituloEstadisticas);
  
  for (const stat of pokemon.stats) {
    //CREO UNA ETIQUETA <div> PARA QUE MUESTRE LAS ESTADISTICAS DEL POKEMON
    const divEstadistica = document.createElement('li');

    //CREO UNA ETIQUETA <label> PARA CADA ESTADISTICA DEL POKEMON
    const labelEstadistica = document.createElement('label');
    labelEstadistica.textContent = `${traducirEstadisticasEspanol(stat.stat.name)}:`;
    divEstadistica.appendChild(labelEstadistica);
    
    //CREO UNA ETIQUETA <p> PARA EL MOSTRAR CADA ESTADISTICA DEL POKEMON
    const estadistica = document.createElement('p');
    estadistica.textContent = stat.base_stat;

    divEstadistica.appendChild(estadistica);
    divRespuesta.appendChild(divEstadistica);
  }
  return divRespuesta;
}

async function traducirHabilidad(abilityURL) {
  try {
    const response = await fetch(abilityURL);
    const data = await response.json();
    return data.names[5].name;
  } catch (error) {
    console.log('No se pudo traducir la habilidad');
    console.error(error)
  }
}

async function traducirTipo(typeURL) {
  try {
    const response = await fetch(typeURL);
    const data = await response.json();

    return data.names[5].name;
  } catch (error) {
    console.log('No se pudo traducir el tipo');
    console.error(error);
  }
}

async function traducirNombre(nameURL) {
  try {
    const response = await fetch(nameURL);
    const data = await response.json()

    return data.names[6].name;
  } catch (error) {
    console.log('No se pudo traducir nombre del pokemon');
    console.error(error);
  }
}

async function getPokemonQuery(query) {
  try {
    const endpoint = "pokemon"
    const response = await fetch(`${url}/${endpoint}${query}`);
    const data = await response.json();

    return data.results;
  } catch (error) {
    console.log('No se pudo obtener los datos de la pokedex de la API');
    console.error(error);
  }
}

async function getPokemonData(url) {
  try {
    const response = await fetch(`${url}`);
    const data = await response.json();

    return data;
  } catch (error) {
    console.log('No se pudo obtener los datos del pokemon de la API');
    console.error(error);
  }
}

function maquetarPaginacion(listado) {
  //-------------------------SELECCIONO LAS DOS BARRAS DE PAGINACION (ARRIBA Y ABAJO) PARA MANEJARLAS A LA VEZ
  const $divPaginacion = document.querySelectorAll('.paginacion');
  $divPaginacion.forEach(element => element.classList.remove('hidden'));
  const cantidad = 20;
  
  for (const $element of $divPaginacion) {
    $element.innerHTML = "";
    const $ul = document.createElement('ul');
    $ul.setAttribute('class', 'flex flex-row py-8 font-medium');
    $element.appendChild($ul);

    const $btnPrev = document.createElement('button');
    $btnPrev.setAttribute('class', 'btn-prev h-10 px-5 text-red-600 transition-colors duration-150 bg-white border border-red-600 border-r-0 rounded-l-lg focus:shadow-outline hover:bg-red-200 hidden');
    $btnPrev.textContent = 'Prev';
    $ul.appendChild($btnPrev);
    
    const $liPaginas = document.createElement('li');
    $liPaginas.setAttribute('class', 'li-paginas h-10 flex flex-row items-center gap-2 px-5 text-red-600 transition-colors duration-150 bg-white rounded-l-lg border border-x-1 border-red-600 focus:shadow-outline hover:bg-red-200');
    $ul.appendChild($liPaginas);

    const $textoPagina = document.createElement('p');
    $textoPagina.setAttribute('class', 'align-baseline');
    $textoPagina.textContent = `Página `;
    $liPaginas.appendChild($textoPagina);

    const $inputPaginado = document.createElement('input');
    $inputPaginado.setAttribute('class', 'input-paginado h-8 w-10 leading-none pt-0 text-center px-1 rounded border border-2 border-red-300');
    $inputPaginado.value = 1

    $inputPaginado.addEventListener('focus', ()  => {
      document.querySelectorAll('.input-paginado').forEach(input => input.value = "");
    });

    $inputPaginado.addEventListener('keypress', e  => {
      const patron = /[0-9]/;
      if (!patron.test(e.key)) {
        if (e.key !== 'Enter')
        e.preventDefault();
      }
    });

    $inputPaginado.addEventListener('keyup', e  => {
      if (e.target.value > Math.ceil(listado.length/cantidad)){
        e.target.value = Math.ceil(listado.length/cantidad);
      }

      if (e.target.value < 1){
        e.target.value = 1;
      }
    });

    $liPaginas.appendChild($inputPaginado);

    const $textoTotalPaginas = document.createElement('p');
    $textoTotalPaginas.setAttribute('class', 'align-baseline');
    $textoTotalPaginas.textContent = `de ${Math.ceil(listado.length/cantidad)}`;
    $liPaginas.appendChild($textoTotalPaginas);

    const $btnNext = document.createElement('button');
    $btnNext.setAttribute('class', 'btn-next h-10 px-5 text-red-600 transition-colors duration-150 bg-white border border-red-600 border-l-0 rounded-r-lg focus:shadow-outline hover:bg-red-200');
    $btnNext.textContent = 'Next';
    $ul.appendChild($btnNext);

    $btnNext.addEventListener('click', async e => {
      document.querySelectorAll('.input-paginado').forEach(element => {
        element.value ++;
        document.querySelectorAll('.btn-prev').forEach(element => element.classList.remove('hidden'));
        document.querySelectorAll('.li-paginas').forEach(element => element.classList.remove('rounded-l-lg'));
        if (parseInt(element.value) >= Math.ceil(listado.length/cantidad)){
          document.querySelectorAll('.btn-next').forEach(element => element.classList.add('hidden','rounded-r-lg'));
          document.querySelectorAll('.li-paginas').forEach(element => element.classList.add('rounded-r-lg'));
        }
      });
      await refrescarPokedex(await getPokemonQuery(`?offset=${(document.querySelector('.input-paginado').value - 1) * cantidad}&limit=${cantidad}`));
    });
    
    $btnPrev.addEventListener('click', async e => {
      document.querySelectorAll('.input-paginado').forEach(element => {
        element.value --;
        document.querySelectorAll('.btn-next').forEach(element => element.classList.remove('hidden'));
        document.querySelectorAll('.li-paginas').forEach(element => element.classList.remove('rounded-r-lg'));
        if (parseInt(element.value) === 1){
          document.querySelectorAll('.btn-prev').forEach(element => element.classList.add('hidden','rounded-l-lg'));
          document.querySelectorAll('.li-paginas').forEach(element => element.classList.add('rounded-l-lg'));
        }
      });
      await refrescarPokedex(await getPokemonQuery(`?offset=${(document.querySelector('.input-paginado').value - 1) * cantidad}&limit=${cantidad}`));
    });

    $inputPaginado.addEventListener('change', async e  => {
      document.querySelectorAll('.input-paginado').forEach(input => input.value = e.target.value);
      await refrescarPokedex(await getPokemonQuery(`?offset=${(e.target.value - 1) * cantidad}&limit=${cantidad}`));

      if (parseInt(e.target.value) === 1) {
        document.querySelectorAll('.btn-prev').forEach(element => element.classList.add('hidden','rounded-l-lg'));
        document.querySelectorAll('.li-paginas').forEach(element => element.classList.add('rounded-l-lg'));
      } else {
        document.querySelectorAll('.btn-prev').forEach(element => element.classList.remove('hidden'));
        document.querySelectorAll('.li-paginas').forEach(element => element.classList.remove('rounded-l-lg'));
      }

      if (parseInt(e.target.value) >= Math.ceil(listado.length/cantidad)) {
        document.querySelectorAll('.btn-next').forEach(element => element.classList.add('hidden','rounded-r-lg'));
        document.querySelectorAll('.li-paginas').forEach(element => element.classList.add('rounded-r-lg'));
      } else {
        document.querySelectorAll('.btn-next').forEach(element => element.classList.remove('hidden'));
        document.querySelectorAll('.li-paginas').forEach(element => element.classList.remove('rounded-r-lg'));
      }
    });
  }
}

function esconderpaginacion(){
  document.querySelectorAll('.paginacion').forEach(element => element.classList.add('hidden'));
}
