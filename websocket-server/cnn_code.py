from keras.preprocessing.image import ImageDataGenerator
import pandas as pd
from tensorflow import keras
import numpy as np
import matplotlib.pyplot as plt
from keras.models import Sequential
from keras.layers import Dense, Conv2D, Flatten, MaxPooling2D, Dropout, BatchNormalization, Activation, GlobalAveragePooling2D
from keras.utils import to_categorical
from keras.preprocessing.image import ImageDataGenerator
from keras.preprocessing import image
from keras.regularizers import l2
from keras import layers
from keras.callbacks import ReduceLROnPlateau, History, ModelCheckpoint, EarlyStopping
from keras import regularizers
from keras.optimizers import Adam, RMSprop, SGD

traindf = pd.read_csv("/kaggle/input/traindata/train.csv", dtype=str)

datagenTrain = ImageDataGenerator(
    rescale=1./255.,
    shear_range=0.2,
    zoom_range=0.5,
    horizontal_flip=True,
    validation_split=0.25
)

train_generator = datagenTrain.flow_from_directory(
    "",
    subset="training",
    batch_size=32,
    seed=42,
    class_mode="binary",
    target_size=(64, 64)
)

valid_generator = datagenTrain.flow_from_directory(
    "",
    subset="validation",
    batch_size=32,
    seed=42,
    class_mode="binary",
    target_size=(64, 64)
)

history = History()


def create_model():
    model = Sequential()

    model.add(Conv2D(32, kernel_size=(3, 3), activation='relu',
              padding="same", input_shape=(224, 224, 3)))
    model.add(Conv2D(32, kernel_size=(3, 3), padding="same", activation='relu'))
    model.add(MaxPooling2D(pool_size=(2, 2)))

    model.add(Conv2D(64, kernel_size=(3, 3), padding="same",
              activation='relu', kernel_regularizer=regularizers.l2(0.001)))
    model.add(Conv2D(64, kernel_size=(3, 3), padding="same", activation='relu'))
    model.add(Conv2D(64, kernel_size=(3, 3), padding="same", activation='relu'))
    model.add(BatchNormalization())
    model.add(MaxPooling2D(pool_size=(2, 2)))
    # strides=(2,2)
    model.add(Dropout(0.2))

    model.add(Conv2D(128, kernel_size=(3, 3), padding="same",
              activation='relu', kernel_regularizer=regularizers.l2(0.001)))
    model.add(Conv2D(128, kernel_size=(3, 3),
              padding="same", activation='relu'))
    model.add(Conv2D(128, kernel_size=(3, 3),
              padding="same", activation='relu'))
    model.add(BatchNormalization())
    model.add(MaxPooling2D(pool_size=(2, 2), strides=(2, 2)))
    model.add(Dropout(0.2))

    model.add(Conv2D(256, kernel_size=(3, 3), padding="same",
              activation='relu', kernel_regularizer=regularizers.l2(0.001)))
    model.add(Conv2D(256, kernel_size=(3, 3),
              padding="same", activation='relu'))
    model.add(Conv2D(256, kernel_size=(3, 3),
              padding="same", activation='relu'))
    model.add(BatchNormalization())
    model.add(MaxPooling2D(pool_size=(2, 2), strides=(2, 2)))
    model.add(Dropout(0.3))

    model.add(Conv2D(512, kernel_size=(3, 3), padding="same",
              activation='relu', kernel_regularizer=regularizers.l2(0.001)))
    model.add(Conv2D(512, kernel_size=(3, 3),
              padding="same", activation='relu'))
    model.add(BatchNormalization())
    model.add(Dropout(0.3))

    model.add(Flatten())

    model.add(Dense(512, activation='relu',
              kernel_regularizer=regularizers.l2(0.001)))
    model.add(Dropout(0.3))

    model.add(Dense(512, activation='relu',
              kernel_regularizer=regularizers.l2(0.001)))
    model.add(Dropout(0.3))

    model.add(Dense(2, activation="softmax"))

    # kernel_regularizer=regularizers.l1_l2(l1=0.01, l2=0.001)

    return model


# RMSprop
optimizer = Adam(lr=0.0001)

checkpoint = ModelCheckpoint('weight_model.h5', verbose=1)

reduce_lr = ReduceLROnPlateau(
    monitor='val_loss', factor=0.1, patience=20, min_lr=0.01)
# earlstop = EarlyStopping(monitor='val_loss', min_delta=0, patience=2, verbose=0, mode='auto', baseline= None, restore_best_weights=True)
callbacks = [history, checkpoint, reduce_lr]

model = create_model()

model.summary()

model.compile(optimizer=optimizer, loss='categorical_crossentropy',
              metrics=['categorical_accuracy'])

model.fit(train_generator, epochs=150,
          validation_data=valid_generator,  callbacks=callbacks)


plt.plot(history.history['loss'])
plt.plot(history.history['val_loss'])
plt.title('model loss')
plt.ylabel('loss')
plt.xlabel('epoch')
plt.legend(['train', 'test'], loc='upper left')
plt.show()

plt.plot(history.history['categorical_accuracy'])
plt.plot(history.history['val_categorical_accuracy'])
plt.title('model accuracy')
plt.ylabel('accuracy')
plt.xlabel('epoch')
plt.legend(['train', 'val'], loc='upper left')
plt.show()

model.save('model1.h5')
