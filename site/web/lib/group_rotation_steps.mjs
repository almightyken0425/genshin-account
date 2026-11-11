/** Merge only adjacent appearances, preserving every move and later switch-backs. */
export function groupRotationSteps(steps = []) {
  return steps.reduce((cards, step) => {
    const previous = cards.at(-1);
    if (previous?.id === step.id) previous.moves.push(...step.moves);
    else cards.push({...step, moves: [...step.moves]});
    return cards;
  }, []);
}
