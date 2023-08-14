import express from "express";
import bodyParser from "body-parser";
import axios from "axios";

import {dirname} from "path";
import { fileURLToPath } from "url";
import { type } from "os";
const __dirname = dirname(fileURLToPath(import.meta.url));

const app = express();
app.use(bodyParser.urlencoded({extended:true}));
app.use(express.static("public"));

const port = 3000;

let serverHost = 'https://pokeapi.co/api/v2';

let pokemon = {
    name: null,
    id: 0,
    type: null,
}

// Exemplo de uso
let typeId = 0; // ID do tipo desejado
let userInputInitial = "";
let pokemonInitial = "";

var pokemonIndex = 0;

app.get("/", (req, res) => {
    res.render("index.ejs");
});

// Make a request to PokéAPI:
async function fetchPokemonType(typeId) {
    const response = await fetch(`https://pokeapi.co/api/v2/type/${typeId}/`);
    const data = await response.json();
    return data;
}

// Verify if the name's initial matches the user's input initial:
function checkInitial(pokemonName, initial) {
    return pokemonName.charAt(0).toLowerCase() === initial.toLowerCase();
}

// Main function to get the list of suitable Pokémon:
async function searchPokemonByTypeAndInitial(typeId, pkmnInitial, userInputInitial) {
    try {
      const typeData = await fetchPokemonType(typeId);
      const pokemonsOfType = typeData.pokemon;
      const filteredPokemons = pokemonsOfType.filter((pokemon) => {
        return checkInitial(pokemon.pokemon.name, userInputInitial) &&
               pokemon.pokemon.name.charAt(0).toLowerCase() === pkmnInitial.toLowerCase();
      });
      return filteredPokemons;
    } catch (error) {
      console.error('Error searching for suitable Pokémon:', error);
    }
}

// Fetch a Pokémon and return its data:
async function returnPokemon(typeId, userInputInitial, pokemonInitial){
    try{ 
        console.log(typeId + " " + userInputInitial + " " + pokemonInitial);

        const selectedPkmn = await searchPokemonByTypeAndInitial(typeId, userInputInitial, pokemonInitial)

        if (selectedPkmn.length > 0) {
            console.log('Pokémon found:');
            selectedPkmn.forEach((pokemon) => {
                console.log(pokemon.pokemon.name);
            })
            pokemonIndex = Math.floor(Math.random() * selectedPkmn.length);
            const pokemonUrl = selectedPkmn[pokemonIndex].pokemon.url;
            const thePokemon = await fetch(`${pokemonUrl}`);
            const data = await thePokemon.json();
            return data; //selectedPkmn[pokemonIndex].id
        }
    } catch {
        console.log('No Pokémon returned.');
    }
}

app.post("/pkmn", async (req, res) => {

    //Get body results and process them in the following order:
    //1. Save the input information
    userInputInitial = req.body.inputName.charAt(0);
    pokemonInitial = userInputInitial;
    typeId = req.body.inputType;

    try{ 
        //2. Try to get a Pokémon with the same initial and with the type selected:
        const rePkmn = await returnPokemon(typeId, userInputInitial, pokemonInitial);
        pokemon = {
            name: rePkmn.name,
            id: rePkmn.id,
            image: rePkmn.sprites["front_default"],
            type: rePkmn.types.map(type => type.type.name).join(", "),
        };
        res.render("result.ejs", { content: pokemon} );
        
    } catch (error) {
        console.log('Nenhum Pokémon encontrado com os critérios. ' + error);
        res.render("result", { message: "You would be a Pokémon still yet to be discovered! Try again with a new combination or when the National Dex gets updated."});
    }
});

app.listen(port, function(req, res){
    console.log(`Server running on port: ${port}`);
});