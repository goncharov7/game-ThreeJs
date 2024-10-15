import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { FontLoader } from 'three/examples/jsm/loaders/FontLoader.js';
import { TextGeometry } from 'three/examples/jsm/geometries/TextGeometry.js';

// Сцена и камера
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(0, 10, 11); // Попробуйте увеличить Y и уменьшить Z
camera.lookAt(0, 0, 0); // Убедитесь, что камера смотрит в центр сцены


// Рендерер
const canvas = document.getElementById('gameCanvas');
const renderer = new THREE.WebGLRenderer({ canvas: canvas, alpha: true, antialias: true });

renderer.shadowMap.enabled = true;
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

window.addEventListener('resize', () => {
  renderer.setSize(window.innerWidth, window.innerHeight);
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
});

// Управление камерой
const controls = new OrbitControls(camera, renderer.domElement);

// Дорога
class Road extends THREE.Mesh {
  constructor() {
    const geometry = new THREE.PlaneGeometry(10, 800);
    const material = new THREE.MeshStandardMaterial({ color: '#808080' });
    super(geometry, material);
    this.rotation.x = -Math.PI / 2;
    this.position.y = -0.5;
  }
}

const road = new Road();
scene.add(road);

//score 
let score = 0; // Переменная для хранения счета

function updateScoreDisplay() {
  const scoreDisplay = document.getElementById('scoreValue');
  scoreDisplay.textContent = score; // Обновляем текст на панели со счетом
}


// Зелёный куб (игрок)
class Player extends THREE.Mesh {
  constructor() {
    const geometry = new THREE.BoxGeometry(1, 1, 1);
    const material = new THREE.MeshStandardMaterial({ color: '#00ff00' });
    super(geometry, material);
    this.position.y = 0.5;
  }

  move(x) {
    this.position.x = THREE.MathUtils.clamp(x, -4.5, 4.5);
  }
}

const player = new Player();
scene.add(player);

// Объявление массива obstacles
const obstacles = [];

// Препятствия (красные кубы)
class Obstacle extends THREE.Mesh {
  constructor(x, z, font) {
    const geometry = new THREE.BoxGeometry(1, 1, 1);
    const material = new THREE.MeshStandardMaterial({ color: 'red' });
    super(geometry, material);
    this.position.set(x, 0.5, z);

    const textMaterial = new THREE.MeshStandardMaterial({ color: 'white' });

    // Сохраняем шрифт для последующего обновления текста
    this.font = font;

    // Инициализация значения текста
    this.currentTextValue = 2; // Начальное значение текста

    // Текст на лицевой грани куба
    this.frontTextGeometry = new TextGeometry(this.currentTextValue.toString(), {
      font: font,
      size: 0.8,
      depth: 0.1,
    });
    this.frontTextMesh = new THREE.Mesh(this.frontTextGeometry, textMaterial);
    this.frontTextMesh.position.set(-0.3, -0.3, 0.5);
    this.frontTextMesh.scale.set(0.95, 0.95, 1);
    this.add(this.frontTextMesh);

    // Текст на верхней грани куба
    this.topTextGeometry = new TextGeometry(this.currentTextValue.toString(), {
      font: font,
      size: 0.8,
      depth: 0.05,
    });
    this.topTextMesh = new THREE.Mesh(this.topTextGeometry, textMaterial);
    this.topTextMesh.rotation.x = -Math.PI / 2;
    this.topTextMesh.position.set(-0.3, 0.51, 0.4);
    this.topTextMesh.scale.set(0.95, 0.95, 1);
    this.add(this.topTextMesh);
  }

  // Метод для обновления значения текста
  updateText(newValue) {
    // Обновляем передний текст
    this.frontTextGeometry.dispose(); // Удаляем старую геометрию
    this.frontTextGeometry = new TextGeometry(newValue.toString(), {
      font: this.font,
      size: 0.8,
      depth: 0.1,
    });
    this.frontTextMesh.geometry = this.frontTextGeometry; // Заменяем геометрию меша

    // Обновляем верхний текст
    this.topTextGeometry.dispose(); // Удаляем старую геометрию
    this.topTextGeometry = new TextGeometry(newValue.toString(), {
      font: this.font,
      size: 0.8,
      depth: 0.05,
    });
    this.topTextMesh.geometry = this.topTextGeometry; // Заменяем геометрию меша
  }
}

// Загрузка шрифта и создание препятствий
let font;

const fontLoader = new FontLoader();
fontLoader.load('./public/font/helvetiker_bold.typeface.json', (font) => {
  createObstacles(font);
});

// Создаем 3 ряда по 2 куба
const createObstacles = (font) => {
  const startZ = -50; // Начальная позиция по Z
  const spacing = 10; // Расстояние между рядами
  const rowOffset = 3; // Расстояние между кубами в ряду

  for (let row = 0; row < 3; row++) {
    for (let col = 0; col < 2; col++) {
      const x = (col - 0.5) * rowOffset * 2; // Позиционируем кубы
      const z = startZ + row * spacing; // Расстояние между рядами
      const obstacle = new Obstacle(x, z, font); // Создание препятствия
      obstacles.push(obstacle);
      scene.add(obstacle); // Добавляем препятствие в сцену
    }
  }
};

// Свет
const light = new THREE.DirectionalLight(0xffffff, 1);
light.position.set(0, 5, 5);
scene.add(light);

scene.add(new THREE.AmbientLight(0xffffff, 0.5));

// Управление мышью
let mouseX = 0;
window.addEventListener('mousemove', (event) => {
  mouseX = (event.clientX / window.innerWidth) * 10 - 5;
});

// Управление касанием (для телефона)
window.addEventListener('touchmove', (event) => {
  const touch = event.touches[0];
  mouseX = (touch.clientX / window.innerWidth) * 10 - 5;
});

// Сфера (снаряд)
class BlueSphere extends THREE.Mesh {
  constructor() {
    const geometry = new THREE.SphereGeometry(0.2, 32, 32);
    const material = new THREE.MeshStandardMaterial({ color: 'blue' });
    super(geometry, material);
    this.velocity = new THREE.Vector3(0, 0, -1); // Задаем начальную скорость сферы
  }

  // Метод для обновления позиции сферы
  update() {
    this.position.add(this.velocity);
  }
}

// Массив для хранения снарядов
const bullets = [];

// Функция стрельбы синими сферами
function shoot() {
  const bullet = new BlueSphere();
  bullet.position.set(player.position.x, player.position.y, player.position.z); // Стартовая позиция сферы - позиция игрока
  bullets.push(bullet); // Добавляем сферу в массив
  scene.add(bullet); // Добавляем сферу в сцену
}

// Запускаем автоматическую стрельбу
setInterval(() => {
  shoot(); // Вызываем функцию стрельбы
}, 1000); // Интервал в 1000 мс (1 секунда)

// Функция для проверки столкновений сферы с препятствием
function checkCollision(bullet, obstacle) {
  const distance = bullet.position.distanceTo(obstacle.position);
  return distance < 1; // Если расстояние меньше 1, значит произошло столкновение
}

function animate() {
  requestAnimationFrame(animate);

  // Двигаем игрока по X на основе позиции мыши
  player.move(mouseX);

  // Обновляем положение препятствий
  obstacles.forEach(obstacle => {
    obstacle.position.z += 0.1;

    // Проверка столкновений с игроком
    if (Math.abs(obstacle.position.x - player.position.x) < 1 &&
        Math.abs(obstacle.position.z - player.position.z) < 1) {
      console.log('Столкновение с игроком!');
      obstacle.position.z = player.position.z + 60;
      // Увеличиваем общий счет
      score += obstacle.currentTextValue; 
      updateScoreDisplay(); // Обновляем отображение счета
    }
  });

  // Обновляем положение синих сфер
  bullets.forEach((bullet, index) => {
    bullet.update();

    // Проверяем столкновения с каждым препятствием
    obstacles.forEach(obstacle => {
      if (checkCollision(bullet, obstacle)) {
        console.log('Столкновение сферы с препятствием!');
    
        // Если у препятствия ещё нет текста, установим начальное значение 2
        if (!obstacle.currentTextValue) {
            obstacle.currentTextValue = 2;
        } else {
            obstacle.currentTextValue += 1; // Увеличиваем текущее значение текста на 1
        }
    
        // Обновляем текст на кубе
        obstacle.updateText(obstacle.currentTextValue);
    
        // Убираем сферу после столкновения
        scene.remove(bullet);
        bullets.splice(index, 1);
    }
    
    });

    // Если сфера ушла далеко, удаляем её
    if (bullet.position.z < player.position.z - 100) {
      scene.remove(bullet);
      bullets.splice(index, 1);
    }
  });

  // Рендер сцены
  renderer.render(scene, camera);
}

animate();