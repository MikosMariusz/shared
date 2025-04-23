<template>
  <v-card class="content-container">
    <template v-if="viewState === 0">
      <v-card-title> Rozpocznij quiz </v-card-title>
      <v-card-actions>
        <v-spacer />
        <v-btn color="primary" @click="startQuiz"> Rozpocznij </v-btn>
      </v-card-actions>
    </template>
    <template v-else-if="viewState === 1">
      <v-card-title> Twój wynik: {{ score }} </v-card-title>
      <v-card-subtitle> Wzkaż na mapie odpowiednie miejsce </v-card-subtitle>
      <v-card-text>
        <v-row class="ma-2 d-flex" style="gap: 10px">
          <span>{{ qestionsList[currentQuestionIndex].question }}</span>
          <v-btn color="primary" variant="outlined" @click="makeHint()">
            Podpowiedź
          </v-btn>
        </v-row>
      </v-card-text>
      <v-card-actions>
        <v-btn
          color="primary"
          :disabled="currentQuestionIndex === 0"
          @click="previousQuestion"
        >
          Poprzednie
        </v-btn>
        <v-btn
          color="primary"
          :disabled="currentQuestionIndex === qestionsList.length - 1"
          @click="nextQuestion"
        >
          Następne
        </v-btn>
        <v-spacer />
        <v-btn
          v-if="currentQuestionIndex === qestionsList.length - 1"
          color="primary"
          @click="endQuiz"
        >
          Zakończ
        </v-btn>
      </v-card-actions>
    </template>
    <template v-else-if="viewState === 2">
      <v-card-title> Quiz zakończony </v-card-title>
      <v-card-subtitle> Twój wynik: {{ score }} </v-card-subtitle>
      <v-card-actions>
        <v-spacer />
        <v-btn color="primary" @click="startQuiz"> Rozpocznij ponownie </v-btn>
      </v-card-actions>
    </template>
  </v-card>
</template>

<script setup>
import { ref } from "vue";
import {
  addMapClickEvent,
  removeMapClickEvent,
  drawCircle,
  clearVectorLayer,
} from "../services/map"; // Adjust the import path as necessary

const qestionsList = [
  {
    id: 1,
    question: "Gdzie znajduje się wjazd na Dorotkę z drogi powiatowej?",
    lat: 50.728666,
    lng: 16.565081,
  },
  {
    id: 2,
    question: "Gdzie na Drotce znajduje się miejsce kultu?",
    lat: 50.724708,
    lng: 16.560653,
  },
  {
    id: 3,
    question: "Gdzie w Piskorzowie znajduje się stara lesniczówka?",
    lat: 50.726153,
    lng: 16.555029,
  },
  {
    id: 4,
    question: "Gdzie znajduje się King Kebab?",
    lat: 50.729018,
    lng: 16.654076,
  },
  {
    id: 5,
    question: "Gdzie znajduje się Krzyż pokutny w Piskorzowie?",
    lat: 50.733394,
    lng: 16.561298,
  },
  {
    id: 6,
    question: "Gdzie znajduje się boisko w Piskorzowie?",
    lat: 50.732382,
    lng: 16.56399,
  },
];

const viewState = ref(0);
const currentQuestionIndex = ref(0);
const score = ref(0);

const startQuiz = () => {
  score.value = 0;
  viewState.value = 1;
  addMapClickEvent(clickCallback);
};

const previousQuestion = () => {
  if (currentQuestionIndex.value > 0) {
    currentQuestionIndex.value--;
  }
  clearVectorLayer();
};

const nextQuestion = () => {
  if (currentQuestionIndex.value < qestionsList.length - 1) {
    currentQuestionIndex.value++;
  }
  clearVectorLayer();
};

const clickCallback = (coords) => {
  const question = qestionsList[currentQuestionIndex.value];

  const latDiff = (coords.lat - question.lat) * 111139;
  const lngDiff =
    (coords.lng - question.lng) *
    111139 *
    Math.cos((question.lat * Math.PI) / 180);

  const distance = Math.sqrt(Math.pow(latDiff, 2) + Math.pow(lngDiff, 2));

  if (distance <= 50) {
    let points = Math.round(50 - distance);

    score.value += points;
    currentQuestionIndex.value++;
  }
};

const endQuiz = () => {
  clearVectorLayer();
  removeMapClickEvent();
  viewState.value = 2;
  currentQuestionIndex.value = 0;
};

const makeHint = () => {
  const question = qestionsList[currentQuestionIndex.value];
  const randomLatOffset = (Math.random() - 0.5) * 0.003; // Random offset for latitude
  const randomLngOffset = (Math.random() - 0.5) * 0.003; // Random offset for longitude

  const hintLat = question.lat + randomLatOffset;
  const hintLng = question.lng + randomLngOffset;

  drawCircle([hintLng, hintLat], 400);
};
</script>

<style scoped>
.content-container {
  position: absolute;
  top: 12px;
  right: 12px;
  width: 400px;
  height: auto;
  z-index: 2;
}

v-card-text {
  height: 400px;
}
</style>
