"""
Domain-specific Lexicon for Harmful Practice Narratives in Narok and Kajiado Counties, Kenya.
Covers Maa (Southern Nilotic) and Swahili (Bantu/Niger-Congo) discourse markers
for FGM (Emuratare e nkan) and Child Marriage (Esiankiki / Ndoa za mapema).
"""

MAA_LEXICON = {
    "fgm": [
        {"term": "emuratare", "meaning": "Circumcision / cut rite of passage", "weight": 0.95},
        {"term": "emuratare e ntoyie", "meaning": "Female circumcision ceremony", "weight": 0.99},
        {"term": "murat", "meaning": "To circumcise / initiate", "weight": 0.85},
        {"term": "enkipaata", "meaning": "Transition ceremony leading up to initiation", "weight": 0.75},
        {"term": "olmurani", "meaning": "Warrior / young man seeking circumcised wife", "weight": 0.60},
        {"term": "entito", "meaning": "Uninitiated young girl", "weight": 0.50},
        {"term": "esiyan", "meaning": "Initiation ceremony / bridal passage", "weight": 0.70},
        {"term": "olamal", "meaning": "Delegation / customary communal gathering", "weight": 0.55},
        {"term": "ilpiron", "meaning": "Godfather / elder age-set advisors in initiation", "weight": 0.65},
    ],
    "child_marriage": [
        {"term": "esiankiki", "meaning": "Young bride / betrothed girl", "weight": 0.95},
        {"term": "erikunoto", "meaning": "Betrothal / taking away the young bride", "weight": 0.90},
        {"term": "enkaputi", "meaning": "In-law alliance / arranged bride price payment", "weight": 0.85},
        {"term": "enkishomi", "meaning": "Gate / clan settlement through girl exchange", "weight": 0.75},
        {"term": "inkishu", "meaning": "Cattle dowry / bride wealth for marriage", "weight": 0.70},
        {"term": "esitaany", "meaning": "Early betrothal negotiations for young girls", "weight": 0.88},
    ],
    "advocacy_challenge": [
        {"term": "meitasheyie", "meaning": "Stop / do not continue the custom", "weight": 0.85},
        {"term": "sukulu", "meaning": "School / formal education over early rite", "weight": 0.80},
        {"term": "enkishon", "meaning": "Life / bodily integrity and health", "weight": 0.60},
        {"term": "tasheyie", "meaning": "Halt the practice", "weight": 0.75},
        {"term": "aishoo", "meaning": "Give girls opportunities / education rights", "weight": 0.70},
    ]
}

SWAHILI_LEXICON = {
    "fgm": [
        {"term": "ukeketaji", "meaning": "Female genital mutilation", "weight": 0.98},
        {"term": "tohara ya wasichana", "meaning": "Female circumcision", "weight": 0.95},
        {"term": "kukeketa", "meaning": "To mutilate / cut", "weight": 0.92},
        {"term": "kukatwa", "meaning": "To be cut / initiated", "weight": 0.85},
        {"term": "ngariba", "meaning": "Traditional cutter / circumciser", "weight": 0.96},
        {"term": "mila ya tohara", "meaning": "Circumcision custom", "weight": 0.88},
        {"term": "kuvuka ungo", "meaning": "Transition to womanhood through cut", "weight": 0.80},
        {"term": "sherehe ya ukeketaji", "meaning": "FGM ceremony celebration", "weight": 0.92},
    ],
    "child_marriage": [
        {"term": "ndoa za mapema", "meaning": "Early marriage", "weight": 0.96},
        {"term": "ndoa za utotoni", "meaning": "Child marriage", "weight": 0.98},
        {"term": "kuozwa", "meaning": "To be given away in marriage", "weight": 0.85},
        {"term": "kuolewa mapema", "meaning": "Marrying early before adulthood", "weight": 0.92},
        {"term": "mahali", "meaning": "Bride price / dowry payment", "weight": 0.70},
        {"term": "mchumba mtoto", "meaning": "Child betrothed", "weight": 0.90},
        {"term": "kukatisha masomo", "meaning": "Dropping out of school for marriage", "weight": 0.85},
    ],
    "advocacy_challenge": [
        {"term": "pinga", "meaning": "Oppose / resist practice", "weight": 0.85},
        {"term": "haki za watoto", "meaning": "Children's rights", "weight": 0.90},
        {"term": "elimu", "meaning": "Education for girls", "weight": 0.75},
        {"term": "sheria", "meaning": "Law / Prohibition of FGM Act", "weight": 0.80},
        {"term": "kuokoa", "meaning": "Rescue from cutting or forced marriage", "weight": 0.88},
        {"term": "madhara", "meaning": "Harm / negative health complications", "weight": 0.82},
        {"term": "haki ya mtoto wa kike", "meaning": "Rights of the girl child", "weight": 0.92},
    ]
}

