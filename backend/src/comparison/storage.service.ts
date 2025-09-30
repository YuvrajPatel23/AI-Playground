import { Injectable } from '@nestjs/common';
import { ComparisonResult, ModelResponse } from './dto/comparison.dto';

export interface StoredSession extends ComparisonResult {
  responses: ModelResponse[];
}

@Injectable()
export class StorageService {
  private sessions = new Map<string, StoredSession>();

  saveSession(session: ComparisonResult) {
    this.sessions.set(session.sessionId, {
      ...session,
      responses: [],
    });
    
    setTimeout(() => {
      this.sessions.delete(session.sessionId);
    }, 3600000);
  }

  saveResponse(sessionId: string, response: ModelResponse) {
    const session = this.sessions.get(sessionId);
    if (session) {
      const existingIndex = session.responses.findIndex(
        (r) => r.model === response.model,
      );
      if (existingIndex >= 0) {
        session.responses[existingIndex] = response;
      } else {
        session.responses.push(response);
      }
    }
  }

  getSession(sessionId: string): StoredSession | undefined {
    return this.sessions.get(sessionId);
  }

  getAllSessions(): StoredSession[] {
    return Array.from(this.sessions.values());
  }
}