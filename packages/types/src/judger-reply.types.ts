export interface ScoreBoardFormat {
    [problemID: string]: PuzzleResultPayload;
}

export type PuzzleResultPayload = {
    subtasks: Subtasks[];
    specialRuleResults?: SpecialRuleResultRecord[];
};

export type SpecialRuleResultRecord = {
    ruleId: string;
    passed: boolean;
    message: string;
    reason?: string;
    checkedAt: string; // ISO
};


export interface Subtasks {
    hidden: TestCaseRecord[];
    visible: TestCaseRecord[];
}
export interface TestCaseRecord {
    status: string;
    userOutput: string;
    expectedOutput: string;
    time: string;
}