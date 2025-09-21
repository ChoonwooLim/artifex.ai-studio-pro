export interface CharacterPreset {
  category: string;
  items: PresetItem[];
}

export interface PresetItem {
  id: string;
  label: string;
  labelKo: string;
  prompt: string;
  tags?: string[];
}

export const CHARACTER_PRESETS = {
  // 체형 (Body Type)
  bodyType: {
    category: "체형",
    items: [
      { id: "slim", label: "Slim", labelKo: "마른", prompt: "slim body type" },
      { id: "athletic", label: "Athletic", labelKo: "운동선수", prompt: "athletic muscular build" },
      { id: "average", label: "Average", labelKo: "보통", prompt: "average body type" },
      { id: "curvy", label: "Curvy", labelKo: "곡선미", prompt: "curvy figure" },
      { id: "stocky", label: "Stocky", labelKo: "건장한", prompt: "stocky build" },
      { id: "tall-slim", label: "Tall & Slim", labelKo: "키크고 마른", prompt: "tall and slim figure" },
      { id: "petite", label: "Petite", labelKo: "작고 귀여운", prompt: "petite body type" },
      { id: "muscular", label: "Muscular", labelKo: "근육질", prompt: "muscular physique" },
      { id: "lean", label: "Lean", labelKo: "날씬한", prompt: "lean body type" },
      { id: "plus-size", label: "Plus Size", labelKo: "플러스 사이즈", prompt: "plus size figure" },
      { id: "hourglass", label: "Hourglass", labelKo: "모래시계", prompt: "hourglass figure" },
      { id: "pear", label: "Pear Shape", labelKo: "배 모양", prompt: "pear-shaped body" },
      { id: "rectangle", label: "Rectangle", labelKo: "직사각형", prompt: "rectangular body shape" },
      { id: "inverted-triangle", label: "Inverted Triangle", labelKo: "역삼각형", prompt: "inverted triangle body shape" },
      { id: "endomorph", label: "Endomorph", labelKo: "내배엽형", prompt: "endomorphic body type" },
      { id: "mesomorph", label: "Mesomorph", labelKo: "중배엽형", prompt: "mesomorphic body type" },
      { id: "ectomorph", label: "Ectomorph", labelKo: "외배엽형", prompt: "ectomorphic body type" },
      { id: "dad-bod", label: "Dad Bod", labelKo: "아빠 몸매", prompt: "dad bod physique" },
      { id: "swimmer", label: "Swimmer's Build", labelKo: "수영선수", prompt: "swimmer's build, broad shoulders" },
      { id: "dancer", label: "Dancer's Body", labelKo: "댄서", prompt: "dancer's physique, flexible" },
      { id: "bodybuilder", label: "Bodybuilder", labelKo: "보디빌더", prompt: "bodybuilder physique" },
      { id: "runner", label: "Runner's Build", labelKo: "러너", prompt: "runner's lean build" },
      { id: "yoga", label: "Yoga Body", labelKo: "요가", prompt: "yoga practitioner's flexible body" },
      { id: "fighter", label: "Fighter's Build", labelKo: "격투가", prompt: "fighter's muscular build" },
      { id: "model", label: "Model Figure", labelKo: "모델", prompt: "fashion model figure" },
      { id: "classic", label: "Classic", labelKo: "클래식", prompt: "classic proportions" },
      { id: "rugged", label: "Rugged", labelKo: "터프한", prompt: "rugged build" },
      { id: "delicate", label: "Delicate", labelKo: "섬세한", prompt: "delicate frame" },
      { id: "sturdy", label: "Sturdy", labelKo: "튼튼한", prompt: "sturdy build" },
      { id: "willowy", label: "Willowy", labelKo: "가냘픈", prompt: "willowy figure" }
    ]
  },

  // 헤어스타일 (Hair Style)
  hairStyle: {
    category: "헤어스타일",
    items: [
      { id: "long-straight", label: "Long Straight", labelKo: "긴 생머리", prompt: "long straight hair" },
      { id: "long-wavy", label: "Long Wavy", labelKo: "긴 웨이브", prompt: "long wavy hair" },
      { id: "long-curly", label: "Long Curly", labelKo: "긴 곱슬머리", prompt: "long curly hair" },
      { id: "shoulder-length", label: "Shoulder Length", labelKo: "어깨 길이", prompt: "shoulder-length hair" },
      { id: "bob-cut", label: "Bob Cut", labelKo: "보브컷", prompt: "bob cut hairstyle" },
      { id: "pixie-cut", label: "Pixie Cut", labelKo: "픽시컷", prompt: "pixie cut" },
      { id: "short-crop", label: "Short Crop", labelKo: "숏크롭", prompt: "short cropped hair" },
      { id: "buzz-cut", label: "Buzz Cut", labelKo: "버즈컷", prompt: "buzz cut" },
      { id: "crew-cut", label: "Crew Cut", labelKo: "크루컷", prompt: "crew cut" },
      { id: "undercut", label: "Undercut", labelKo: "언더컷", prompt: "undercut hairstyle" },
      { id: "mohawk", label: "Mohawk", labelKo: "모히칸", prompt: "mohawk hairstyle" },
      { id: "dreadlocks", label: "Dreadlocks", labelKo: "드레드락", prompt: "dreadlocks" },
      { id: "braids", label: "Braids", labelKo: "땋은머리", prompt: "braided hair" },
      { id: "ponytail", label: "Ponytail", labelKo: "포니테일", prompt: "ponytail hairstyle" },
      { id: "bun", label: "Bun", labelKo: "번헤어", prompt: "hair in a bun" },
      { id: "afro", label: "Afro", labelKo: "아프로", prompt: "afro hairstyle" },
      { id: "mullet", label: "Mullet", labelKo: "멀렛", prompt: "mullet hairstyle" },
      { id: "shaved", label: "Shaved", labelKo: "삭발", prompt: "shaved head" },
      { id: "side-part", label: "Side Part", labelKo: "옆가르마", prompt: "side-parted hair" },
      { id: "middle-part", label: "Middle Part", labelKo: "중간가르마", prompt: "middle-parted hair" },
      { id: "slicked-back", label: "Slicked Back", labelKo: "올백", prompt: "slicked back hair" },
      { id: "quiff", label: "Quiff", labelKo: "퀴프", prompt: "quiff hairstyle" },
      { id: "pompadour", label: "Pompadour", labelKo: "폼파도르", prompt: "pompadour hairstyle" },
      { id: "fade", label: "Fade", labelKo: "페이드", prompt: "fade haircut" },
      { id: "layers", label: "Layered", labelKo: "레이어드", prompt: "layered haircut" },
      { id: "bangs", label: "With Bangs", labelKo: "앞머리", prompt: "hair with bangs" },
      { id: "ombre", label: "Ombre", labelKo: "옴브레", prompt: "ombre hair color" },
      { id: "highlights", label: "Highlights", labelKo: "하이라이트", prompt: "highlighted hair" },
      { id: "two-tone", label: "Two-tone", labelKo: "투톤", prompt: "two-tone hair color" },
      { id: "messy", label: "Messy", labelKo: "헝클어진", prompt: "messy hairstyle" }
    ]
  },

  // 의상 스타일 (Clothing Style)
  clothingStyle: {
    category: "의상 스타일",
    items: [
      { id: "business-suit", label: "Business Suit", labelKo: "비즈니스 정장", prompt: "professional business suit" },
      { id: "casual-wear", label: "Casual Wear", labelKo: "캐주얼", prompt: "casual everyday clothing" },
      { id: "streetwear", label: "Streetwear", labelKo: "스트릿웨어", prompt: "urban streetwear style" },
      { id: "formal-dress", label: "Formal Dress", labelKo: "정장 드레스", prompt: "elegant formal dress" },
      { id: "tuxedo", label: "Tuxedo", labelKo: "턱시도", prompt: "black tuxedo" },
      { id: "military-uniform", label: "Military Uniform", labelKo: "군복", prompt: "military uniform" },
      { id: "police-uniform", label: "Police Uniform", labelKo: "경찰복", prompt: "police officer uniform" },
      { id: "doctor-coat", label: "Doctor's Coat", labelKo: "의사 가운", prompt: "white doctor's coat" },
      { id: "school-uniform", label: "School Uniform", labelKo: "교복", prompt: "school uniform" },
      { id: "sportswear", label: "Sportswear", labelKo: "운동복", prompt: "athletic sportswear" },
      { id: "leather-jacket", label: "Leather Jacket", labelKo: "가죽 재킷", prompt: "leather jacket outfit" },
      { id: "denim", label: "Denim Style", labelKo: "데님", prompt: "denim jeans and jacket" },
      { id: "vintage", label: "Vintage", labelKo: "빈티지", prompt: "vintage clothing style" },
      { id: "gothic", label: "Gothic", labelKo: "고스", prompt: "gothic fashion style" },
      { id: "punk", label: "Punk", labelKo: "펑크", prompt: "punk rock style" },
      { id: "hipster", label: "Hipster", labelKo: "힙스터", prompt: "hipster fashion" },
      { id: "bohemian", label: "Bohemian", labelKo: "보헤미안", prompt: "bohemian style clothing" },
      { id: "preppy", label: "Preppy", labelKo: "프레피", prompt: "preppy style outfit" },
      { id: "cyberpunk", label: "Cyberpunk", labelKo: "사이버펑크", prompt: "cyberpunk fashion" },
      { id: "steampunk", label: "Steampunk", labelKo: "스팀펑크", prompt: "steampunk attire" },
      { id: "medieval", label: "Medieval", labelKo: "중세", prompt: "medieval clothing" },
      { id: "fantasy-armor", label: "Fantasy Armor", labelKo: "판타지 갑옷", prompt: "fantasy armor outfit" },
      { id: "traditional-hanbok", label: "Hanbok", labelKo: "한복", prompt: "traditional Korean hanbok" },
      { id: "kimono", label: "Kimono", labelKo: "기모노", prompt: "Japanese kimono" },
      { id: "cheongsam", label: "Cheongsam", labelKo: "치파오", prompt: "Chinese cheongsam dress" },
      { id: "lab-coat", label: "Lab Coat", labelKo: "실험복", prompt: "scientist lab coat" },
      { id: "chef-uniform", label: "Chef Uniform", labelKo: "요리사복", prompt: "chef's uniform" },
      { id: "pilot-uniform", label: "Pilot Uniform", labelKo: "파일럿복", prompt: "pilot uniform" },
      { id: "space-suit", label: "Space Suit", labelKo: "우주복", prompt: "astronaut space suit" },
      { id: "superhero", label: "Superhero Costume", labelKo: "슈퍼히어로", prompt: "superhero costume" }
    ]
  },

  // 성격 특징 (Personality Traits)
  personality: {
    category: "성격 특징",
    items: [
      { id: "confident", label: "Confident", labelKo: "자신감", prompt: "confident expression" },
      { id: "shy", label: "Shy", labelKo: "수줍은", prompt: "shy and timid expression" },
      { id: "friendly", label: "Friendly", labelKo: "친근한", prompt: "warm friendly demeanor" },
      { id: "serious", label: "Serious", labelKo: "진지한", prompt: "serious focused expression" },
      { id: "playful", label: "Playful", labelKo: "장난스러운", prompt: "playful cheerful expression" },
      { id: "mysterious", label: "Mysterious", labelKo: "신비로운", prompt: "mysterious enigmatic look" },
      { id: "aggressive", label: "Aggressive", labelKo: "공격적", prompt: "aggressive fierce expression" },
      { id: "calm", label: "Calm", labelKo: "차분한", prompt: "calm serene expression" },
      { id: "energetic", label: "Energetic", labelKo: "활발한", prompt: "energetic vibrant expression" },
      { id: "melancholic", label: "Melancholic", labelKo: "우울한", prompt: "melancholic sad expression" },
      { id: "cheerful", label: "Cheerful", labelKo: "명랑한", prompt: "cheerful happy expression" },
      { id: "stoic", label: "Stoic", labelKo: "냉정한", prompt: "stoic emotionless expression" },
      { id: "romantic", label: "Romantic", labelKo: "로맨틱", prompt: "romantic dreamy expression" },
      { id: "rebellious", label: "Rebellious", labelKo: "반항적", prompt: "rebellious defiant look" },
      { id: "wise", label: "Wise", labelKo: "지혜로운", prompt: "wise knowing expression" },
      { id: "innocent", label: "Innocent", labelKo: "순수한", prompt: "innocent pure expression" },
      { id: "cunning", label: "Cunning", labelKo: "교활한", prompt: "cunning sly expression" },
      { id: "brave", label: "Brave", labelKo: "용감한", prompt: "brave courageous expression" },
      { id: "anxious", label: "Anxious", labelKo: "불안한", prompt: "anxious worried expression" },
      { id: "determined", label: "Determined", labelKo: "결연한", prompt: "determined focused expression" },
      { id: "curious", label: "Curious", labelKo: "호기심", prompt: "curious inquisitive expression" },
      { id: "proud", label: "Proud", labelKo: "자랑스러운", prompt: "proud dignified expression" },
      { id: "humble", label: "Humble", labelKo: "겸손한", prompt: "humble modest expression" },
      { id: "charismatic", label: "Charismatic", labelKo: "카리스마", prompt: "charismatic commanding presence" },
      { id: "introverted", label: "Introverted", labelKo: "내향적", prompt: "introverted reserved expression" },
      { id: "extroverted", label: "Extroverted", labelKo: "외향적", prompt: "extroverted outgoing expression" },
      { id: "thoughtful", label: "Thoughtful", labelKo: "사려깊은", prompt: "thoughtful contemplative expression" },
      { id: "impulsive", label: "Impulsive", labelKo: "충동적", prompt: "impulsive spontaneous expression" },
      { id: "disciplined", label: "Disciplined", labelKo: "절제된", prompt: "disciplined controlled expression" },
      { id: "creative", label: "Creative", labelKo: "창의적", prompt: "creative artistic expression" }
    ]
  },

  // 얼굴형 (Face Shape)
  faceShape: {
    category: "얼굴형",
    items: [
      { id: "oval", label: "Oval", labelKo: "계란형", prompt: "oval face shape" },
      { id: "round", label: "Round", labelKo: "둥근형", prompt: "round face shape" },
      { id: "square", label: "Square", labelKo: "사각형", prompt: "square jaw face shape" },
      { id: "heart", label: "Heart", labelKo: "하트형", prompt: "heart-shaped face" },
      { id: "diamond", label: "Diamond", labelKo: "다이아몬드", prompt: "diamond face shape" },
      { id: "oblong", label: "Oblong", labelKo: "긴형", prompt: "oblong face shape" },
      { id: "triangle", label: "Triangle", labelKo: "삼각형", prompt: "triangular face shape" },
      { id: "rectangle", label: "Rectangle", labelKo: "직사각형", prompt: "rectangular face shape" },
      { id: "v-line", label: "V-Line", labelKo: "V라인", prompt: "v-line face shape" },
      { id: "chiseled", label: "Chiseled", labelKo: "조각같은", prompt: "chiseled facial features" },
      { id: "soft", label: "Soft", labelKo: "부드러운", prompt: "soft facial features" },
      { id: "angular", label: "Angular", labelKo: "각진", prompt: "angular facial features" },
      { id: "delicate", label: "Delicate", labelKo: "섬세한", prompt: "delicate facial features" },
      { id: "strong", label: "Strong", labelKo: "강한", prompt: "strong facial features" },
      { id: "refined", label: "Refined", labelKo: "세련된", prompt: "refined facial features" },
      { id: "classic", label: "Classic", labelKo: "클래식", prompt: "classic facial features" },
      { id: "exotic", label: "Exotic", labelKo: "이국적", prompt: "exotic facial features" },
      { id: "youthful", label: "Youthful", labelKo: "어려보이는", prompt: "youthful face" },
      { id: "mature", label: "Mature", labelKo: "성숙한", prompt: "mature facial features" },
      { id: "aristocratic", label: "Aristocratic", labelKo: "귀족적", prompt: "aristocratic facial features" },
      { id: "rugged", label: "Rugged", labelKo: "거친", prompt: "rugged facial features" },
      { id: "baby-face", label: "Baby Face", labelKo: "동안", prompt: "baby face features" },
      { id: "gaunt", label: "Gaunt", labelKo: "호리호리한", prompt: "gaunt facial features" },
      { id: "full", label: "Full", labelKo: "통통한", prompt: "full facial features" },
      { id: "narrow", label: "Narrow", labelKo: "좁은", prompt: "narrow face shape" },
      { id: "wide", label: "Wide", labelKo: "넓은", prompt: "wide face shape" },
      { id: "long", label: "Long", labelKo: "긴", prompt: "long face shape" },
      { id: "short", label: "Short", labelKo: "짧은", prompt: "short face shape" },
      { id: "balanced", label: "Balanced", labelKo: "균형잡힌", prompt: "balanced facial proportions" },
      { id: "unique", label: "Unique", labelKo: "독특한", prompt: "unique facial features" }
    ]
  },

  // 연령대 (Age Range)
  ageRange: {
    category: "연령대",
    items: [
      { id: "child", label: "Child", labelKo: "어린이", prompt: "child 5-10 years old" },
      { id: "preteen", label: "Preteen", labelKo: "초등학생", prompt: "preteen 11-13 years old" },
      { id: "teen", label: "Teenager", labelKo: "청소년", prompt: "teenager 14-17 years old" },
      { id: "young-adult", label: "Young Adult", labelKo: "청년", prompt: "young adult 18-25 years old" },
      { id: "adult", label: "Adult", labelKo: "성인", prompt: "adult 26-35 years old" },
      { id: "middle-aged", label: "Middle Aged", labelKo: "중년", prompt: "middle aged 36-50 years old" },
      { id: "senior", label: "Senior", labelKo: "노년", prompt: "senior 51-65 years old" },
      { id: "elderly", label: "Elderly", labelKo: "고령", prompt: "elderly 66+ years old" },
      { id: "20s", label: "20s", labelKo: "20대", prompt: "in their twenties" },
      { id: "30s", label: "30s", labelKo: "30대", prompt: "in their thirties" },
      { id: "40s", label: "40s", labelKo: "40대", prompt: "in their forties" },
      { id: "50s", label: "50s", labelKo: "50대", prompt: "in their fifties" },
      { id: "60s", label: "60s", labelKo: "60대", prompt: "in their sixties" },
      { id: "70s", label: "70s", labelKo: "70대", prompt: "in their seventies" },
      { id: "college", label: "College Age", labelKo: "대학생", prompt: "college age student" },
      { id: "graduate", label: "Graduate", labelKo: "대학원생", prompt: "graduate student age" },
      { id: "newborn", label: "Newborn", labelKo: "신생아", prompt: "newborn baby" },
      { id: "toddler", label: "Toddler", labelKo: "유아", prompt: "toddler 1-3 years old" },
      { id: "preschool", label: "Preschool", labelKo: "유치원", prompt: "preschool age 4-5 years" },
      { id: "elementary", label: "Elementary", labelKo: "초등", prompt: "elementary school age" },
      { id: "middle-school", label: "Middle School", labelKo: "중학생", prompt: "middle school age" },
      { id: "high-school", label: "High School", labelKo: "고등학생", prompt: "high school age" },
      { id: "young-professional", label: "Young Professional", labelKo: "젊은 직장인", prompt: "young professional 25-30" },
      { id: "experienced", label: "Experienced", labelKo: "경력자", prompt: "experienced professional 35-45" },
      { id: "veteran", label: "Veteran", labelKo: "베테랑", prompt: "veteran professional 45-55" },
      { id: "retired", label: "Retired", labelKo: "은퇴", prompt: "retired age 65+" },
      { id: "prime", label: "Prime Years", labelKo: "전성기", prompt: "in their prime years" },
      { id: "mature-adult", label: "Mature Adult", labelKo: "성숙한 성인", prompt: "mature adult 40-50" },
      { id: "golden-years", label: "Golden Years", labelKo: "황금기", prompt: "golden years 60-70" },
      { id: "timeless", label: "Timeless", labelKo: "연령불명", prompt: "ageless timeless appearance" }
    ]
  },

  // 액세서리 (Accessories)
  accessories: {
    category: "액세서리",
    items: [
      { id: "glasses", label: "Glasses", labelKo: "안경", prompt: "wearing glasses" },
      { id: "sunglasses", label: "Sunglasses", labelKo: "선글라스", prompt: "wearing sunglasses" },
      { id: "earrings", label: "Earrings", labelKo: "귀걸이", prompt: "wearing earrings" },
      { id: "necklace", label: "Necklace", labelKo: "목걸이", prompt: "wearing a necklace" },
      { id: "bracelet", label: "Bracelet", labelKo: "팔찌", prompt: "wearing bracelets" },
      { id: "watch", label: "Watch", labelKo: "시계", prompt: "wearing a wristwatch" },
      { id: "ring", label: "Ring", labelKo: "반지", prompt: "wearing rings" },
      { id: "hat", label: "Hat", labelKo: "모자", prompt: "wearing a hat" },
      { id: "cap", label: "Cap", labelKo: "캡모자", prompt: "wearing a baseball cap" },
      { id: "beanie", label: "Beanie", labelKo: "비니", prompt: "wearing a beanie" },
      { id: "scarf", label: "Scarf", labelKo: "스카프", prompt: "wearing a scarf" },
      { id: "tie", label: "Tie", labelKo: "넥타이", prompt: "wearing a necktie" },
      { id: "bowtie", label: "Bow Tie", labelKo: "보타이", prompt: "wearing a bow tie" },
      { id: "belt", label: "Belt", labelKo: "벨트", prompt: "wearing a belt" },
      { id: "gloves", label: "Gloves", labelKo: "장갑", prompt: "wearing gloves" },
      { id: "headband", label: "Headband", labelKo: "머리띠", prompt: "wearing a headband" },
      { id: "bandana", label: "Bandana", labelKo: "반다나", prompt: "wearing a bandana" },
      { id: "piercing", label: "Piercing", labelKo: "피어싱", prompt: "with piercings" },
      { id: "tattoo", label: "Tattoo", labelKo: "문신", prompt: "with tattoos" },
      { id: "backpack", label: "Backpack", labelKo: "백팩", prompt: "carrying a backpack" },
      { id: "purse", label: "Purse", labelKo: "핸드백", prompt: "carrying a purse" },
      { id: "briefcase", label: "Briefcase", labelKo: "서류가방", prompt: "carrying a briefcase" },
      { id: "headphones", label: "Headphones", labelKo: "헤드폰", prompt: "wearing headphones" },
      { id: "mask", label: "Face Mask", labelKo: "마스크", prompt: "wearing a face mask" },
      { id: "crown", label: "Crown", labelKo: "왕관", prompt: "wearing a crown" },
      { id: "tiara", label: "Tiara", labelKo: "티아라", prompt: "wearing a tiara" },
      { id: "badge", label: "Badge", labelKo: "배지", prompt: "wearing badges" },
      { id: "pin", label: "Pin", labelKo: "핀", prompt: "wearing decorative pins" },
      { id: "chain", label: "Chain", labelKo: "체인", prompt: "wearing chains" },
      { id: "pendant", label: "Pendant", labelKo: "펜던트", prompt: "wearing a pendant" }
    ]
  },

  // 특별한 특징 (Special Features)
  specialFeatures: {
    category: "특별한 특징",
    items: [
      { id: "scar", label: "Scar", labelKo: "흉터", prompt: "with a distinctive scar" },
      { id: "freckles", label: "Freckles", labelKo: "주근깨", prompt: "with freckles" },
      { id: "dimples", label: "Dimples", labelKo: "보조개", prompt: "with dimples" },
      { id: "beauty-mark", label: "Beauty Mark", labelKo: "점", prompt: "with a beauty mark" },
      { id: "heterochromia", label: "Heterochromia", labelKo: "오드아이", prompt: "with heterochromia eyes" },
      { id: "albino", label: "Albino", labelKo: "백색증", prompt: "albino appearance" },
      { id: "vitiligo", label: "Vitiligo", labelKo: "백반증", prompt: "with vitiligo skin" },
      { id: "birthmark", label: "Birthmark", labelKo: "모반", prompt: "with a birthmark" },
      { id: "prosthetic", label: "Prosthetic", labelKo: "의수/의족", prompt: "with prosthetic limb" },
      { id: "eyepatch", label: "Eyepatch", labelKo: "안대", prompt: "wearing an eyepatch" },
      { id: "braces", label: "Braces", labelKo: "치아교정기", prompt: "wearing dental braces" },
      { id: "wheelchair", label: "Wheelchair", labelKo: "휠체어", prompt: "in a wheelchair" },
      { id: "cane", label: "Cane", labelKo: "지팡이", prompt: "using a cane" },
      { id: "hearing-aid", label: "Hearing Aid", labelKo: "보청기", prompt: "wearing hearing aids" },
      { id: "cybernetic", label: "Cybernetic", labelKo: "사이버네틱", prompt: "with cybernetic enhancements" },
      { id: "wings", label: "Wings", labelKo: "날개", prompt: "with wings" },
      { id: "horns", label: "Horns", labelKo: "뿔", prompt: "with horns" },
      { id: "tail", label: "Tail", labelKo: "꼬리", prompt: "with a tail" },
      { id: "elf-ears", label: "Elf Ears", labelKo: "엘프 귀", prompt: "with pointed elf ears" },
      { id: "fangs", label: "Fangs", labelKo: "송곳니", prompt: "with fangs" },
      { id: "glowing-eyes", label: "Glowing Eyes", labelKo: "빛나는 눈", prompt: "with glowing eyes" },
      { id: "scales", label: "Scales", labelKo: "비늘", prompt: "with scales" },
      { id: "fur", label: "Fur", labelKo: "털", prompt: "with fur" },
      { id: "mechanical", label: "Mechanical Parts", labelKo: "기계 부품", prompt: "with mechanical parts" },
      { id: "ethereal", label: "Ethereal", labelKo: "천상의", prompt: "ethereal appearance" },
      { id: "transparent", label: "Transparent", labelKo: "투명한", prompt: "semi-transparent appearance" },
      { id: "luminescent", label: "Luminescent", labelKo: "발광", prompt: "luminescent skin" },
      { id: "crystalline", label: "Crystalline", labelKo: "수정", prompt: "crystalline features" },
      { id: "metallic", label: "Metallic", labelKo: "금속", prompt: "metallic appearance" },
      { id: "unique-mark", label: "Unique Mark", labelKo: "독특한 표시", prompt: "with unique markings" }
    ]
  }
};

export const getAllPresetCategories = () => {
  return Object.keys(CHARACTER_PRESETS);
};

export const getPresetsByCategory = (category: string) => {
  return CHARACTER_PRESETS[category as keyof typeof CHARACTER_PRESETS];
};

export const generatePromptFromPresets = (selectedPresets: Record<string, string[]>) => {
  const prompts: string[] = [];
  
  Object.entries(selectedPresets).forEach(([category, itemIds]) => {
    const categoryData = CHARACTER_PRESETS[category as keyof typeof CHARACTER_PRESETS];
    if (categoryData) {
      itemIds.forEach(itemId => {
        const item = categoryData.items.find(i => i.id === itemId);
        if (item) {
          prompts.push(item.prompt);
        }
      });
    }
  });
  
  return prompts.join(", ");
};