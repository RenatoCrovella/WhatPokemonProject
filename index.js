import express from "express";
import bodyParser from "body-parser";
import axios from "axios";

import {dirname} from "path";
import { fileURLToPath } from "url";
import { Console } from "console";
const __dirname = dirname(fileURLToPath(import.meta.url));

const app = express();
app.use(bodyParser.urlencoded({extended:true}));
app.use(express.static("public"));

const port = 3000;

let serverHost = 'https://pokeapi.co/api/v2';

var pokemon = {
    name: null,
    id: 0,
    type: null,
}

// Exemplo de uso
const typeId = 6; // ID do tipo desejado
const userInputInitial = "s";
const pokemonInitial = "s";

var pokemonIndex = 0;

app.get("/", (req, res) => {
    res.render("index.ejs");
});

// Função para fazer uma requisição à API da PokéAPI
async function fetchPokemonType(typeId) {
    const response = await fetch(`https://pokeapi.co/api/v2/type/${typeId}/`);
    const data = await response.json();
    return data;
}

// Função para verificar se a inicial do nome coincide com a inicial inserida pelo usuário
function checkInitial(pokemonName, initial) {
    return pokemonName.charAt(0).toLowerCase() === initial.toLowerCase();
}

// Função principal para realizar a busca
async function searchPokemonByTypeAndInitial(typeId, initial, userInputInitial) {
    try {
      const typeData = await fetchPokemonType(typeId);
      //console.log(typeData); // Adicione este log para ver a estrutura dos dados retornados
      const pokemonsOfType = typeData.pokemon;
      const filteredPokemons = pokemonsOfType.filter((pokemon) => {
        return checkInitial(pokemon.pokemon.name, userInputInitial) &&
               pokemon.pokemon.name.charAt(0).toLowerCase() === initial.toLowerCase();
      });
      console.log("filteredPokemons.length: " + filteredPokemons.length);
      return filteredPokemons;
    } catch (error) {
      console.error('Erro ao buscar informações:', error);
    }
}

async function returnPokemon(typeId, userInputInitial, pokemonInitial){
    try{ 
        console.log(typeId + " " + userInputInitial + " " + pokemonInitial);
        const selectedPkmn = await searchPokemonByTypeAndInitial(typeId, userInputInitial, pokemonInitial)
        console.log(selectedPkmn);
        if (selectedPkmn.length > 0) {
            console.log('Pokémons encontrados:');
            selectedPkmn.forEach((pokemon) => {
                console.log(pokemon.pokemon.name);
            })
            pokemonIndex = Math.floor(Math.random() * selectedPkmn.length);
            console.log(pokemonIndex + " " + selectedPkmn[pokemonIndex].pokemon.url);
            const pokemonUrl = selectedPkmn[pokemonIndex].pokemon.url;
            console.log(pokemonIndex + " " + pokemonUrl);
            const xadrao = await fetch(`${pokemonUrl}`);
            console.log(xadrao);
            const data = await xadrao.json();
            return data; //selectedPkmn[pokemonIndex].id
        }
    } catch {
        console.log('Try não funfou');
    }
}

app.post("/pkmn", async (req, res) => {
    //recebe os resultados do body e os processa na seguinte ordem:

    try{ 
        const rePkmn = await returnPokemon(typeId, userInputInitial, pokemonInitial);
        console.log("Passou pela escolha de pokémon (rePkmn)")
        console.log(rePkmn + " " + rePkmn.name + " " + rePkmn.id + " " + rePkmn.types);
        pokemon = {
            name: rePkmn.name,
            id: rePkmn.id,
            image: rePkmn.sprites["front_default"],
            type: rePkmn.types.map(type => type.type.name).join(", "),
        };
        console.log(pokemon + " ou " + pokemon.name);
        res.render("result.ejs", { content: pokemon} );
        
    } catch (error) {
        console.log('Nenhum Pokémon encontrado com os critérios. ' + error);
    }

        //1- Salva os pkmn com a inicial do nome da pessoa num array
        //2- Checa se algum desses pokémon tem o tipo selecionado
        //3- Caso positivo, retorna o PKmn selecionado. Se não, retorna uma mensagem de erro dizendo que a pessoa seria um 
        //Pokemon ainda não catalogado na Pokedex. 

    //Renderiza a página com a resposta contendo os dados do pkmn sorteado (pkmnData).
});

app.listen(port, function(req, res){
    console.log(`Server running on port: ${port}`);
});