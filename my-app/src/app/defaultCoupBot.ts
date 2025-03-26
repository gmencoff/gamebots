/* eslint-disable @typescript-eslint/no-unused-vars */

export class MyCoupBot {

  // Implement the methods of MyCoupBot.

  handleGameStart(): void {
    // Can do setup action on game start
  }

  handleChooseAction(gameState: VisibleGameState): Action {
    // Simple strategy: If we have 7+ coins, coup the first available player
    if (gameState.coins >= 7) {
      const target = gameState.other_players.find(p => !p.visible_card)?.player_id;
      if (target) {
        return new Coup(target);
      }
    }
    
    // Default to income if no other action is chosen
    return new Income();
  }

  handleAssassinationResponse(playerId: string, gameState: VisibleGameState): AllowOrBlock {
    // Simple strategy: Block if we have a Contessa, otherwise allow
    const hasContessa = gameState.hand.some(card => card.card === Card.Contessa && !card.revealed);
    return hasContessa ? AllowOrBlock.Allow : AllowOrBlock.Block;
  }

  handleForeignAidResponse(playerId: string, gameState: VisibleGameState): AllowOrBlock {
    // Simple strategy: Block if we have a Duke, otherwise allow
    const hasDuke = gameState.hand.some(card => card.card === Card.Duke && !card.revealed);
    return hasDuke ? AllowOrBlock.Allow : AllowOrBlock.Block;
  }

  handleStealResponse(playerId: string, gameState: VisibleGameState): StealResponse {
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

  handleOfferChallenge(playerId: string, action: Action, gameState: VisibleGameState): ChallengeResponse {
    // Simple strategy: Never challenge
    return ChallengeResponse.No_challenge;
  }
}

// ==========================================
// Available types (DO NOT MODIFY):
// ==========================================

// ==========================================
// Actions:
// ==========================================

export interface Action {
  getActionData(): ActionData;
}

export interface ActionData {
  type: string;
  target_player_id?: string;
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
  
  target_player_id: string;

  constructor(target_player_id: string) {
    this.target_player_id = target_player_id;
  }

    getActionData(): ActionData {
        return {
            type: 'Steal',
            target_player_id: this.target_player_id
        }
    }
}

export class Assassinate implements Action {
  
  target_player_id: string;

  constructor(target_player_id: string) {
    this.target_player_id = target_player_id;
  }

    getActionData(): ActionData {
        return {
            type: 'Assassinate',
            target_player_id: this.target_player_id
        }
    }
}

export class Coup implements Action {
  
  target_player_id: string;

  constructor(target_player_id: string) {
    this.target_player_id = target_player_id;
  }

  getActionData(): ActionData {
    return {
      type: 'Coup',
      target_player_id: this.target_player_id
    };
  }
}

// ==========================================
// Responses:
// ==========================================

export enum AllowOrBlock {
  Allow,
  Block
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
  Card_1,
  Card_2
}

export enum ChallengeResponse {
  Challenge,
  No_challenge
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
    Duke,
    Assassin,
    Captain,
    Ambassador,
    Contessa
}