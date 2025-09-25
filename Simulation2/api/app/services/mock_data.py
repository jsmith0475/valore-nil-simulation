from typing import List

from app.schemas.program import Program, ProgramMetrics
from app.schemas.athlete import Athlete, BehavioralProfile

_programs: List[Program] = [
    Program(
        id="auburn_mbb",
        name="Auburn Men's Basketball",
        conference="SEC",
        tier="Power 5",
        phase="Phase 1 Basketball POC",
        metrics=ProgramMetrics(
            fan_reach=0.73,
            nil_baseline=4_200_000,
            community_highlights=["Auburn Family Network", "Regional Sponsor Ecosystem"],
        ),
    ),
    Program(
        id="sacstate_mbb",
        name="Sacramento State Men's Basketball",
        conference="Big Sky",
        tier="Mid-Major",
        phase="Phase 1 Basketball POC",
        metrics=ProgramMetrics(
            fan_reach=0.55,
            nil_baseline=1_800_000,
            community_highlights=["Capitol Corporate Partners", "NorCal Alumni Hub"],
        ),
    ),
    Program(
        id="houston_mbb",
        name="Houston Men's Basketball",
        conference="Big 12",
        tier="Power 5",
        phase="Phase 1 Basketball POC",
        metrics=ProgramMetrics(
            fan_reach=0.77,
            nil_baseline=4_600_000,
            community_highlights=["Urban Sponsor Grid", "Legacy NBA Pipeline"],
        ),
    ),
    Program(
        id="gonzaga_mbb",
        name="Gonzaga Men's Basketball",
        conference="WCC",
        tier="Mid-Major",
        phase="Phase 1 Basketball POC",
        metrics=ProgramMetrics(
            fan_reach=0.74,
            nil_baseline=4_000_000,
            community_highlights=["National Mid-Major Loyalists", "Pacific Northwest Corporate Ties"],
        ),
    ),
    Program(
        id="kansas_mbb",
        name="Kansas Men's Basketball",
        conference="Big 12",
        tier="Power 5",
        phase="Phase 1 Basketball POC",
        metrics=ProgramMetrics(
            fan_reach=0.83,
            nil_baseline=5_200_000,
            community_highlights=["Rock Chalk Collective", "Historic Blueblood Market"],
        ),
    ),
    Program(
        id="villanova_mbb",
        name="Villanova Men's Basketball",
        conference="Big East",
        tier="Power 5",
        phase="Phase 1 Basketball POC",
        metrics=ProgramMetrics(
            fan_reach=0.68,
            nil_baseline=3_500_000,
            community_highlights=["Philly Main Line Network", "Northeast Brand Portfolio"],
        ),
    ),
    Program(
        id="southcarolina_wbb",
        name="South Carolina Women's Basketball",
        conference="SEC",
        tier="Power 5",
        phase="Phase 1 Basketball POC",
        metrics=ProgramMetrics(
            fan_reach=0.81,
            nil_baseline=3_800_000,
            community_highlights=["Women's Sports Leadership", "Columbia Corporate Partners"],
        ),
    ),
    Program(
        id="stanford_wbb",
        name="Stanford Women's Basketball",
        conference="Pac-12",
        tier="Power 5",
        phase="Phase 1 Basketball POC",
        metrics=ProgramMetrics(
            fan_reach=0.71,
            nil_baseline=3_200_000,
            community_highlights=["Silicon Valley Innovation Partners", "Academic Prestige"],
        ),
    ),
    Program(
        id="louisville_wbb",
        name="Louisville Women's Basketball",
        conference="ACC",
        tier="Power 5",
        phase="Phase 1 Basketball POC",
        metrics=ProgramMetrics(
            fan_reach=0.72,
            nil_baseline=3_000_000,
            community_highlights=["Derby City Sponsor Belt", "Women-Owned Business Coalition"],
        ),
    ),
]


_athletes: List[Athlete] = [
    Athlete(
        id="auburn_guard",
        program_id="auburn_mbb",
        name="Jalen Carter",
        position="Guard",
        archetype="Playmaker",
        class_year="Sophomore",
        behavior=BehavioralProfile(
            parasocial_strength=0.86,
            identity_alignment=0.81,
            authenticity_signal=0.88,
            network_multiplier=1.27,
            notes=[
                "Weekly livestream Q&A maintains direct fan intimacy",
                "Shared hometown roots with 40% of the local fanbase",
            ],
        ),
    ),
    Athlete(
        id="sacstate_forward",
        program_id="sacstate_mbb",
        name="Miguel Alvarez",
        position="Forward",
        archetype="Connector",
        class_year="Junior",
        behavior=BehavioralProfile(
            parasocial_strength=0.78,
            identity_alignment=0.74,
            authenticity_signal=0.82,
            network_multiplier=1.19,
            notes=[
                "Vlog series drives sustained engagement across NorCal campuses",
                "Bilingual outreach expands sponsor resonance",
            ],
        ),
    ),
    Athlete(
        id="houston_guard",
        program_id="houston_mbb",
        name="Marcus Reed",
        position="Guard",
        archetype="Closer",
        class_year="Senior",
        behavior=BehavioralProfile(
            parasocial_strength=0.84,
            identity_alignment=0.79,
            authenticity_signal=0.90,
            network_multiplier=1.31,
            notes=[
                "Post-game analysis threads trend nationally",
                "Disaster relief activism elevates trust metrics",
            ],
        ),
    ),
    Athlete(
        id="gonzaga_center",
        program_id="gonzaga_mbb",
        name="Leo Markovic",
        position="Center",
        archetype="Anchor",
        class_year="Sophomore",
        behavior=BehavioralProfile(
            parasocial_strength=0.73,
            identity_alignment=0.77,
            authenticity_signal=0.80,
            network_multiplier=1.22,
            notes=[
                "Global student audience taps into weekly analytics podcast",
                "International heritage fosters expanded donor outreach",
            ],
        ),
    ),
    Athlete(
        id="kansas_wing",
        program_id="kansas_mbb",
        name="Devon Ellis",
        position="Wing",
        archetype="Emergent Star",
        class_year="Freshman",
        behavior=BehavioralProfile(
            parasocial_strength=0.82,
            identity_alignment=0.85,
            authenticity_signal=0.87,
            network_multiplier=1.29,
            notes=[
                "Interactive NIL journey polls create participatory fandom",
                "Legacy families cite relatable upbringing",
            ],
        ),
    ),
    Athlete(
        id="villanova_guard",
        program_id="villanova_mbb",
        name="Chris Donnelly",
        position="Guard",
        archetype="Mentor",
        class_year="Senior",
        behavior=BehavioralProfile(
            parasocial_strength=0.76,
            identity_alignment=0.72,
            authenticity_signal=0.83,
            network_multiplier=1.18,
            notes=[
                "Podcast breakdowns reinforce basketball IQ perception",
                "Literacy advocacy builds trust with parent demographics",
            ],
        ),
    ),
    Athlete(
        id="southcarolina_guard",
        program_id="southcarolina_wbb",
        name="Amara Fields",
        position="Guard",
        archetype="Catalyst",
        class_year="Junior",
        behavior=BehavioralProfile(
            parasocial_strength=0.89,
            identity_alignment=0.87,
            authenticity_signal=0.91,
            network_multiplier=1.33,
            notes=[
                "Triple-double narratives trend across women's sports media",
                "Equity keynote cements leadership positioning",
            ],
        ),
    ),
    Athlete(
        id="stanford_forward",
        program_id="stanford_wbb",
        name="Riley Chen",
        position="Forward",
        archetype="Innovator",
        class_year="Senior",
        behavior=BehavioralProfile(
            parasocial_strength=0.80,
            identity_alignment=0.83,
            authenticity_signal=0.92,
            network_multiplier=1.26,
            notes=[
                "STEM scholarship campaign deepens alumni pride",
                "Wellness app fosters peer-to-peer community growth",
            ],
        ),
    ),
    Athlete(
        id="louisville_guard",
        program_id="louisville_wbb",
        name="Tiana Brooks",
        position="Guard",
        archetype="Storyteller",
        class_year="Sophomore",
        behavior=BehavioralProfile(
            parasocial_strength=0.77,
            identity_alignment=0.82,
            authenticity_signal=0.85,
            network_multiplier=1.21,
            notes=[
                "Mentorship vignettes resonate with women-owned businesses",
                "Mental health storytelling elevates authenticity perception",
            ],
        ),
    ),
]



def list_programs() -> List[Program]:
    return _programs


def list_athletes(program_id: str | None = None) -> List[Athlete]:
    if program_id:
        return [a for a in _athletes if a.program_id == program_id]
    return _athletes


_scenarios_data = [
    {
        "id": "auburn_vs_kentucky",
        "program_id": "auburn_mbb",
        "opponent": "Kentucky",
        "lineup": ["auburn_guard", "kansas_wing", "houston_guard"],
        "win_probability": 0.68,
        "nil_uplift": 0.14,
        "fan_sentiment": [0.62, 0.71, 0.75, 0.8, 0.84],
    },
    {
        "id": "sacstate_vs_montana",
        "program_id": "sacstate_mbb",
        "opponent": "Montana",
        "lineup": ["sacstate_forward", "gonzaga_center", "villanova_guard"],
        "win_probability": 0.58,
        "nil_uplift": 0.11,
        "fan_sentiment": [0.48, 0.55, 0.6, 0.66, 0.7],
    },
    {
        "id": "houston_vs_baylor",
        "program_id": "houston_mbb",
        "opponent": "Baylor",
        "lineup": ["houston_guard", "auburn_guard", "gonzaga_center"],
        "win_probability": 0.72,
        "nil_uplift": 0.17,
        "fan_sentiment": [0.7, 0.76, 0.79, 0.83, 0.87],
    },
    {
        "id": "gonzaga_vs_saintmarys",
        "program_id": "gonzaga_mbb",
        "opponent": "Saint Mary's",
        "lineup": ["gonzaga_center", "villanova_guard", "kansas_wing"],
        "win_probability": 0.64,
        "nil_uplift": 0.12,
        "fan_sentiment": [0.58, 0.63, 0.68, 0.72, 0.76],
    },
    {
        "id": "kansas_vs_duke",
        "program_id": "kansas_mbb",
        "opponent": "Duke",
        "lineup": ["kansas_wing", "auburn_guard", "houston_guard"],
        "win_probability": 0.7,
        "nil_uplift": 0.16,
        "fan_sentiment": [0.66, 0.74, 0.79, 0.85, 0.9],
    },
    {
        "id": "villanova_vs_setonhall",
        "program_id": "villanova_mbb",
        "opponent": "Seton Hall",
        "lineup": ["villanova_guard", "kansas_wing", "auburn_guard"],
        "win_probability": 0.6,
        "nil_uplift": 0.1,
        "fan_sentiment": [0.54, 0.57, 0.62, 0.66, 0.7],
    },
    {
        "id": "southcarolina_vs_lsu",
        "program_id": "southcarolina_wbb",
        "opponent": "LSU",
        "lineup": ["southcarolina_guard", "stanford_forward", "louisville_guard"],
        "win_probability": 0.76,
        "nil_uplift": 0.19,
        "fan_sentiment": [0.74, 0.79, 0.83, 0.88, 0.92],
    },
    {
        "id": "stanford_vs_ucla",
        "program_id": "stanford_wbb",
        "opponent": "UCLA",
        "lineup": ["stanford_forward", "southcarolina_guard", "louisville_guard"],
        "win_probability": 0.69,
        "nil_uplift": 0.15,
        "fan_sentiment": [0.65, 0.7, 0.76, 0.81, 0.85],
    },
    {
        "id": "louisville_vs_notredame",
        "program_id": "louisville_wbb",
        "opponent": "Notre Dame",
        "lineup": ["louisville_guard", "southcarolina_guard", "stanford_forward"],
        "win_probability": 0.63,
        "nil_uplift": 0.13,
        "fan_sentiment": [0.59, 0.62, 0.67, 0.72, 0.77],
    },
]


def list_scenarios(program_id: str | None = None):
    from app.schemas.scenario import Scenario

    data = _scenarios_data
    if program_id:
        data = [s for s in data if s["program_id"] == program_id]
    return [Scenario(**item) for item in data]

_metrics_data = {
    "valuation_accuracy": 0.92,
    "demographic_parity": 0.98,
    "athlete_earnings_lift": 0.25,
    "compliance_cost_reduction": 0.6,
}


def get_metrics():
    from app.schemas.metrics import ValidationMetrics

    return ValidationMetrics(**_metrics_data)
