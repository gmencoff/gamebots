/* eslint-disable @typescript-eslint/no-unused-vars */

// ==========================================
// Implement the methods of MyCoupBot Class
// ==========================================

export class MyCoupBot implements CoupBot {

  myId: number = 0;

  handleGameStart(playerId: number): void {
    // Can do setup action on game start
    this.myId = playerId;
  }

  handleChooseAction(gameState: VisibleGameState): Action {
    // Simple strategy: If we have 7+ coins, coup the first available player
    if (gameState.coins >= 7) {
      const target = gameState.other_players.find(p => !p.visible_card)?.player_id;
      if (target) {
        return new Coup(target);
      } else {
        return new Coup(gameState.other_players[0].player_id);
      }
    }
    
    // Default to income if no other action is chosen
    return new Income();
  }

  handleAssassinationResponse(playerId: number, gameState: VisibleGameState): AllowOrBlock {
    // Simple strategy: Block if we have a Contessa, otherwise allow
    const hasContessa = gameState.hand.some(card => card.card === Card.Contessa && !card.revealed);
    return hasContessa ? AllowOrBlock.Block : AllowOrBlock.Allow;
  }

  handleForeignAidResponse(playerId: number, gameState: VisibleGameState): AllowOrBlock {
    // Simple strategy: Block if we have a Duke, otherwise allow
    const hasDuke = gameState.hand.some(card => card.card === Card.Duke && !card.revealed);
    return hasDuke ? AllowOrBlock.Block : AllowOrBlock.Allow;
  }

  handleStealResponse(playerId: number, gameState: VisibleGameState): StealResponse {
    // Simple strategy: Block if we have Ambassador or Captain, otherwise allow
    const hasCaptain = gameState.hand.some(card => (card.card === Card.Captain && !card.revealed));
    const hasAmbassador = gameState.hand.some(card => (card.card === Card.Ambassador && !card.revealed));

    if (hasCaptain) {
      return new StealResponse(AllowOrBlock.Block, Card.Captain);
    } else if (hasAmbassador) {
      return new StealResponse(AllowOrBlock.Block, Card.Ambassador);
    } else {
      return new StealResponse(AllowOrBlock.Allow);
    }
  }

  handleChooseCardsToReturn(cards: Card[], gameState: VisibleGameState): Card[] {
    // Simple strategy: Keep the first two cards
    return cards.slice(0, 2);
  }

  handleRevealCard(card1: Card, card2: Card, gameState: VisibleGameState): RevealCardResponse {
    // Simple strategy: Always reveal the first card
    return RevealCardResponse.Card_1;
  }

  handleOfferChallenge(playerId: number, action: Action, gameState: VisibleGameState): ChallengeResponse {
    // Simple strategy: Never challenge
    return ChallengeResponse.No_challenge;
  }

  handleActionChosen(playerId: number, action: Action): void {
    // Can do something when an action is chosen
  }

  handleLostInfluence(playerId: number, card: Card): void {
    // Can do something when a player loses influence
  }

  handleNewCard(playerId: number, card: Card): void {
    // Can do something when a player receives a new card
  }

  handleChallenge(playerId: number, hascard: boolean): void {
    // Can do something when a challenge is made
  }

  handlePlayerResponded(playerId: number): void {
    // Can do something when a challenge is made
  }
}

// ==========================================
// Available types (DO NOT MODIFY):
// ==========================================

// ==========================================
// Coup Bot Interface:
// ==========================================

export interface CoupBot {
  handleGameStart(playerId: number): void
  handleChooseAction(gameState: VisibleGameState): Action
  handleAssassinationResponse(playerId: number, gameState: VisibleGameState): AllowOrBlock
  handleForeignAidResponse(playerId: number, gameState: VisibleGameState): AllowOrBlock
  handleStealResponse(playerId: number, gameState: VisibleGameState): StealResponse
  handleChooseCardsToReturn(cards: Card[], gameState: VisibleGameState): Card[]
  handleRevealCard(card1: Card, card2: Card, gameState: VisibleGameState): RevealCardResponse
  handleOfferChallenge(playerId: number, action: Action, gameState: VisibleGameState): ChallengeResponse
  handleActionChosen(playerId: number, action: Action): void
  handleLostInfluence(playerId: number, card: Card): void
  handleNewCard(playerId: number, card: Card): void
  handleChallenge(playerId: number, hascard: boolean): void
  handlePlayerResponded(playerId: number): void
}

// ==========================================
// Actions:
// ==========================================

export interface Action {
  getActionData(): ActionData;
}

export interface ActionData {
  type: string;
  player_id?: string;
}

export class Income implements Action {
  getActionData(): ActionData {
    return {
      type: 'Income'
    };
  }
}

export class ForeignAid implements Action {
  getActionData(): ActionData {
    return {
      type: 'ForeignAid'
    };
  }
}

export class Exchange implements Action {
  getActionData(): ActionData {
    return {
      type: 'Exchange'
    };
  }
}

export class Tax implements Action {
  getActionData(): ActionData {
    return {
      type: 'Tax'
    };
  }
}

export class Steal implements Action {
  
  player_id: string;

  constructor(player_id: string) {
    this.player_id = player_id;
  }

    getActionData(): ActionData {
        return {
            type: 'Steal',
            player_id: this.player_id
        }
    }
}

export class Assassinate implements Action {
  
  player_id: string;

  constructor(player_id: string) {
    this.player_id = player_id;
  }

    getActionData(): ActionData {
        return {
            type: 'Assassinate',
            player_id: this.player_id
        }
    }
}

export class Coup implements Action {
  
  player_id: string;

  constructor(player_id: string) {
    this.player_id = player_id;
  }

  getActionData(): ActionData {
    return {
      type: 'Coup',
      player_id: this.player_id
    };
  }
}

// ==========================================
// Responses:
// ==========================================

export enum AllowOrBlock {
  Allow = "Allow",
  Block = "Block"
}

export class StealResponse {
  type: AllowOrBlock;
  card?: Card;

  constructor(type: AllowOrBlock, card?: Card) {
    this.type = type;
    this.card = card;
  }
}

export enum RevealCardResponse {
  Card_1 = "Card_1",
  Card_2 = "Card_2"
}

export enum ChallengeResponse {
  Challenge = "Challenge",
  No_challenge = "No_challenge"
}

// ==========================================
// Game State Data:
// ==========================================

export interface CardInHand {
  card: Card;
  revealed: boolean;
}

export interface OtherPlayer {
  player_id: string;
  visible_card: Card | null;
  coins: number;
}

export interface VisibleGameState {
  hand: CardInHand[];
  coins: number;
  other_players: OtherPlayer[];
  active_player_id: string;
}

export enum Card {
    Duke = "Duke",
    Assassin = "Assassin",
    Captain = "Captain",
    Ambassador = "Ambassador",
    Contessa = "Contessa"
}