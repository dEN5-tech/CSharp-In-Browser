import type { EducationalStage } from '../types/mono.ts';
import { EDUCATIONAL_STAGES } from '../curriculum/stages.ts';

export class StageNavigator {
  private currentStageIndex = 0;
  private onStageSelectCallbacks: Set<(stage: EducationalStage) => void> = new Set();
  private completedStages: Set<string> = new Set();

  constructor(private navListEl: HTMLElement, private detailsEl: HTMLElement) {
    this.renderNavList();
    this.renderCurrentStageDetails();
  }

  public getCurrentStage(): EducationalStage {
    return EDUCATIONAL_STAGES[this.currentStageIndex];
  }

  public onStageSelect(cb: (stage: EducationalStage) => void): () => void {
    this.onStageSelectCallbacks.add(cb);
    return () => this.onStageSelectCallbacks.delete(cb);
  }

  public markStageCompleted(stageId: string): void {
    this.completedStages.add(stageId);
    this.renderNavList();
  }

  public selectStageByIndex(index: number): void {
    if (index < 0 || index >= EDUCATIONAL_STAGES.length) return;
    this.currentStageIndex = index;
    this.renderNavList();
    this.renderCurrentStageDetails();
    const current = this.getCurrentStage();
    this.onStageSelectCallbacks.forEach((cb) => cb(current));
  }

  public nextStage(): void {
    if (this.currentStageIndex < EDUCATIONAL_STAGES.length - 1) {
      this.selectStageByIndex(this.currentStageIndex + 1);
    }
  }

  public prevStage(): void {
    if (this.currentStageIndex > 0) {
      this.selectStageByIndex(this.currentStageIndex - 1);
    }
  }

  private renderNavList(): void {
    this.navListEl.innerHTML = EDUCATIONAL_STAGES.map((stage, idx) => {
      const isActive = idx === this.currentStageIndex;
      const isDone = this.completedStages.has(stage.id);

      return `
        <button 
          class="stage-nav-item ${isActive ? 'active' : ''} ${isDone ? 'completed' : ''}" 
          data-stage-idx="${idx}"
        >
          <div class="stage-nav-header">
            <span class="stage-badge">${stage.category}</span>
            <span class="stage-status-icon">${isDone ? '✓' : isActive ? '●' : '○'}</span>
          </div>
          <div class="stage-nav-title">Stage ${stage.stageNumber}: ${stage.title.split(': ')[1] || stage.title}</div>
        </button>
      `;
    }).join('');

    this.navListEl.querySelectorAll('.stage-nav-item').forEach((btn) => {
      btn.addEventListener('click', () => {
        const idx = parseInt(btn.getAttribute('data-stage-idx') || '0', 10);
        this.selectStageByIndex(idx);
      });
    });
  }

  private renderCurrentStageDetails(): void {
    const stage = this.getCurrentStage();

    this.detailsEl.innerHTML = `
      <div class="stage-detail-header">
        <div class="stage-tags">
          <span class="badge category-badge">${stage.category}</span>
          <span class="badge level-badge">Stage ${stage.stageNumber} of ${EDUCATIONAL_STAGES.length}</span>
        </div>
        <h2 class="stage-title">${stage.title}</h2>
        <p class="stage-subtitle">${stage.subtitle}</p>
      </div>

      <div class="stage-body">
        <div class="stage-summary">${stage.summary}</div>

        <div class="learning-goals-box">
          <div class="box-title">🎯 Stage Objectives</div>
          <ul>
            ${stage.learningGoals.map((goal) => `<li>${goal}</li>`).join('')}
          </ul>
        </div>

        <details class="hints-accordion">
          <summary>💡 Hints & Tips</summary>
          <div class="hints-content">
            <ol>
              ${stage.hints.map((hint) => `<li>${hint}</li>`).join('')}
            </ol>
          </div>
        </details>
      </div>
    `;
  }
}
