import React, { useEffect, useState, useRef } from 'react';
import Card from './Card';
import axios from 'axios';
import {v4 as uuid} from 'uuid';

const Deck = () => {
    const [deckId, setDeckId] = useState(null);
    const [cards, setCards] = useState([]);
    const intervalId = useRef();
    const [drawing, setDrawing] = useState(false);
    
    useEffect( () => {
        const fetchShuffledDeck = async () => {
            const res = await axios.get(`http://deckofcardsapi.com/api/deck/new/shuffle/?deck_count=1`);
            if (res.data?.success) {
                setDeckId(res.data.deck_id);
            } else {
                throw new Error('Error fetching deck');
            };
        };
        fetchShuffledDeck();
    },[]);

    const drawCard = async () => {
        const res = await axios.get(`http://deckofcardsapi.com/api/deck/${deckId}/draw/`);
        if (res.data?.success) {
            const { image } = res.data.cards[0];
            const id = uuid();
            const newCard = <Card key={id} image={image} />;
            setCards(cards => [...cards, newCard]);
        } else if (res.data?.error === "Not enough cards remaining to draw 1 additional") {
            stopDrawing();
            alert('Error: no cards remaining');
        } else {
            stopDrawing();
            throw new Error('Error fetching card')
        };
    };

    const handleDraw = () => {
        drawCard();
    };

    const drawOnInterval = (interval) => {
        intervalId.current = setInterval(drawCard, interval);
        setDrawing(d => true);
    };

    const stopDrawing = () => {
        clearInterval(intervalId.current);
        intervalId.current = null;
        setDrawing(d => false);
    }

    return (
        <div>
            <p>{deckId ? 'Deck' : 'Loading...'}</p>
            <button onClick={handleDraw}>Draw Card</button>
            {drawing ? <button onClick={stopDrawing}>Stop Drawing</button> : <button onClick={() => drawOnInterval(1000)}>Draw Repeatedly</button>}
            {cards}
        </div>
    )
};

export default Deck;