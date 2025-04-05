import { Action, AllowOrBlock, Card, ChallengeResponse, CoupBot, RevealCardResponse, StealResponse, VisibleGameState } from "./coupBot";

// Run the user created bot by creating an instance of the Bot class and redirecting the server messages to the bots methods
export class BotRunner {

    ws: WebSocket;
    bot: CoupBot;
    playerId: number = 0;
    runNextAction?: () => void;
    messagesReceived: any[] = [];
    outgoingMessagesBlocked: boolean = false;
    
    constructor(url: string, bot: CoupBot) {
        this.bot = bot;
        this.ws = new WebSocket(url);
        this.runNextAction = () => {};

        this.ws.onopen = () => {
            console.log('Connected to server');
        };
    
        this.ws.onmessage = (event) => {
            const message = JSON.parse(event.data);
            if (this.bot) {
                this.handleServerMessage(this.bot, message);
            }
        };
    
        this.ws.onclose = () => console.log('Disconnected');
        this.ws.onerror = (error) => console.log(`WebSocket Error: ${error}`);
    }

    sendResponse() {
        if (this.runNextAction && !this.outgoingMessagesBlocked) {
            this.runNextAction();
            console.log('Response sent');
            this.runNextAction = undefined;
        }
    }

    rerunLastStep() {
        if (this.messagesReceived.length > 0) {
            const lastMessage = this.messagesReceived[this.messagesReceived.length - 1];
            this.handleServerMessage(this.bot, lastMessage);
        }
    }

    killGame() {
        this.ws?.close();
    }

    updateBot(bot: CoupBot) {
        // Set the bot and re-run all commands that were sent up until this point
        this.bot = bot;
        const prevMessages = this.messagesReceived;
        this.messagesReceived = [];
        this.outgoingMessagesBlocked = true;
        prevMessages.forEach((message) => {
            this.handleServerMessage(this.bot, message);
        });
        this.outgoingMessagesBlocked = false;
    }

    handleServerMessage(bot: CoupBot, message: any) {

        // Store messages for playback
        this.messagesReceived.push(message);

        console.log(`Received message: ${JSON.stringify(message)}`);

        this.processMessage(bot, message);
    }

    processMessage(bot: CoupBot, message: any) {
        switch (message.type) {
          case 'Game_start': {
            this.playerId = message.self_player_id;
            bot.handleGameStart(message.self_player_id);
            break;
          }
      
          case 'Choose_action': {
            const gameState = this.parseVisibleGameState(message.visible_game_state);
            const action = bot.handleChooseAction(gameState);
            console.log(`Your bot's response: ${JSON.stringify(action.getActionData())}`);
            this.runNextAction = () => {
                this.sendActionToServer(action);
            }
            break;
          }
      
          case 'Choose_assasination_response': {
            const gameState = this.parseVisibleGameState(message.visible_game_state);
            const response = bot.handleAssassinationResponse(message.player_id, gameState);
            console.log(`Your bot's response: ${JSON.stringify(response)}`);
            this.runNextAction = () => {
                this.sendAllowOrBlockToServer(response);
            }
            break;
          }
      
          case 'Choose_foreign_aid_response': {
            const gameState = this.parseVisibleGameState(message.visible_game_state);
            const response = bot.handleForeignAidResponse(message.player_id, gameState);
            console.log(`Your bot's response: ${JSON.stringify(response)}`);
            this.runNextAction = () => {
                this.sendAllowOrBlockToServer(response);
            }
            break;
          }
      
          case 'Choose_steal_response': {
            const gameState = this.parseVisibleGameState(message.visible_game_state);
            const response = bot.handleStealResponse(message.player_id, gameState);
            console.log(`Your bot's response: ${JSON.stringify(response)}`);
            this.runNextAction = () => {
                this.sendStealResponseToServer(response);
            }
            break;
          }
      
          case 'Choose_cards_to_return': {
            const gameState = this.parseVisibleGameState(message.visible_game_state);
            const chosenCards = bot.handleChooseCardsToReturn(message.cards, gameState);
            console.log(`Your bot's response: ${JSON.stringify(chosenCards)}`);
            this.runNextAction = () => {
                this.sendCardsToReturnToServer(chosenCards);
            }
            break;
          }
      
          case 'Reveal_card': {
            const gameState = this.parseVisibleGameState(message.visible_game_state);
            const revealResponse = bot.handleRevealCard(message.card_1, message.card_2, gameState);
            console.log(`Your bot's response: ${JSON.stringify(revealResponse)}`);
            this.runNextAction = () => {
                this.sendRevealCardToServer(revealResponse);
            }
            break;
          }
      
          case 'Offer_challenge': {
            const gameState = this.parseVisibleGameState(message.visible_game_state);
            const challengeResponse = bot.handleOfferChallenge(message.acting_player_id, message.action, gameState);
            console.log(`Your bot's response: ${JSON.stringify(challengeResponse)}`);
            this.runNextAction = () => {
                this.offerChallengeResponseToServer(challengeResponse);
            }
            break;
          }
      
          case 'Action_chosen': {
            bot.handleActionChosen(message.player_id, message.action);
            break;
          }
      
          case 'Lost_influence': {
            bot.handleLostInfluence(message.player_id, message.card);
            break;
          }
      
          case 'New_card': {
            bot.handleNewCard(message.player_id, message.card);
            break;
          }
      
          case 'Challenge': {
            bot.handleChallenge(message.challenging_player_id, message.has_required_card);
            break;
          }
      
          case 'Player_responded': {
            bot.handlePlayerResponded(message.player_id);
            break;
          }
      
          default: {
            console.log(`Unknown message type: ${message.type}`);
          }
        }
      }
      
      sendActionToServer(action: Action) {
        const actionData = action.getActionData();
        this.ws?.send(JSON.stringify(actionData));
      }

      sendAllowOrBlockToServer(response: AllowOrBlock) {
        const responseData = {type: response}
        this.ws?.send(JSON.stringify(responseData));
      }

      sendStealResponseToServer(response: StealResponse) {
        const responseData = {type: response.type, card: response.card}
        this.ws?.send(JSON.stringify(responseData));
      }

      sendCardsToReturnToServer(chosenCards: Card[]) {
        this.ws?.send(JSON.stringify(chosenCards));
      }

      sendRevealCardToServer(revealResponse: RevealCardResponse) {
        this.ws?.send(JSON.stringify(revealResponse));
      }

      offerChallengeResponseToServer(challengeResponse: ChallengeResponse) {
        const responseData = {type: challengeResponse}
        this.ws?.send(JSON.stringify(responseData));
      }

      parseVisibleGameState(visibleGameState: any): VisibleGameState {
        const state: VisibleGameState = {
            hand: visibleGameState.hand,
            coins: visibleGameState.coins,
            other_players: visibleGameState.other_players,
            active_player_id: visibleGameState.active_player_id,
        };
        return state
      }
}