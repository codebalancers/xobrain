import { Injectable } from '@angular/core';
import { CardEntity } from '../entity/card.entity';
import { Observable } from 'rxjs/Observable';

@Injectable()
export class CardService {

  public getCard(id: number): Observable<CardEntity> {
    // const cardRepository = getRepository(CardEntity);
    // const card = await cardRepository.findOneById(1);
    // // card.name = "Umed";
    // await userRepository.save(user);


    return null;
  }
}
