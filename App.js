
import * as Location from 'expo-location'
import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Text, ScrollView, Dimensions, ActivityIndicator } from 'react-native';
import { Fontisto } from '@expo/vector-icons';

/**
 * View 는 자체적으로 이미 Flex Container이므로 display: flex 처러 먼저 선언해 줄 필요 없다. 
 * 웹에서는 style={{flexDirection: "row"}} 가 기본이지만 모바일에서는 그 반대 column이 기본
 * 
 * 많은 경우 레이아웃에서 width, heigth를 지정하는 경우는 없다. 고정된 값으로는 반응형 디자인을 할 수 없으므로 
 * style={{ width: 200, height: 200}}
 * 
 * 대신 아래와 같이 
 * 부모 flex: 1 - 부모가 정해져야 그 아래 자식들 비율을 정할 수 있음 
 * 자식 flex: 1 - 비율을 의미함.
 * 
 * ScrollView는 스크롤이 필요한 곳에 view, 대신 이용하면 됩니다. 
 *  ㄴ prop: horizontal = 수평으로 
 *  ㄴ prop: pagingEnabled = 스크롤이 물 흐르듯 걍 넘어가는게 아니라 페이지가 있는 것처럼 살짝씩 걸리는 거
 *  ㄴ prop: showsHorizontalScrollIndicator = 페이지 표시기 가리기 
 * ==> prop에 따라 안드로이드 혹은 ios에서만 작동하는게 있으니 주의
 * 
 * map( () => ()) --> {} 아님
 */

// 화면 크기 재기
const { width: SCREEN_WIDTH } = Dimensions.get("window");

// const SCREEN_WIDTH = Dimensions.get("window").width;  같은 의미
// console.log(SCREEN_WIDTH); // 411.42857142857144

// 실제 API키는 어플리케시션 소스상에 있으면 안된다. 실제 플젝에서는 서버에 넣지만 이건 테스트니까 임시로 여기에 넣는것임.
// openweathermap
const API_KEY = "bb26541ad76658b14b2807113b8811b2";

const icons = {
  Snow: "snowflake",
  Clear: "day-sunny",
  Clouds: "cloudy",
  Rain: "rains",
  Thunderstorm: "lightning",
  Drizzle: "rain",
  Atmosphere:"cloudy-gusts"

}

export default function App() {
  const [ok, setOk] = useState("Loading...");
  const [district, setDistrict] = useState("Loading...");
  const [days, setDays] = useState([]);
  const getWeather = async() => {
    // 유저 위치 사용 권한 받기
    const {granted} = await Location.requestForegroundPermissionsAsync(); // 앱 사용 중에만 위치를 사용함.
    if (!granted){
      setOk(false);
    }

    // 현재 위치 찾기
    const {coords: {latitude, longitude}} = await Location.getCurrentPositionAsync({accuracy: 5});
    
    // reverseGeocodeAsync 응답이 오지 않아서  구글클라우드플랫폼에서 API키 생성 후 추가 
    Location.setGoogleApiKey("AIzaSyDZ9RpaQXwjihdkfgoe7e7LyycnyCI3CLc");
    
    // 위도 경도로 지역 찾기
    const location = await Location.reverseGeocodeAsync(
      {latitude, longitude}, 
      {useGoogleMaps:true} // true 하면 결제연동을 해야 정상적으로 api응답 받을 수 있음 2022-01-06
      );
    
    setDistrict(location[0].district);

    const response = await fetch(`https://api.openweathermap.org/data/2.5/onecall?lat=${latitude}&lon=${longitude}&exclude=alerts&appid=${API_KEY}&units=metric`);
    const json = await response.json();
    console.log(json.daily)
    setDays(json.daily);
  }
  useEffect(() => {
    getWeather();
  }, []);

  return (
    <View style={styles.container}>
      <View style={styles.city}>
        <Text style={styles.cityName}>{district}</Text>
      </View>
      <ScrollView
        pagingEnabled
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.weather}
      >
        {days.length == 0 ? (
          <View style={{...styles.day, alignItems: "center"}}>
            <ActivityIndicator
              color="white"
              size="large"
              style={{ marginTop: 10 }}
            />
          </View>
        ) : (
          days.map((day, index) => (
            <View key={index} style={styles.day}>
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  width: "100%",
                  justifyContent: "space-between",
                }}
              >
                <Text style={styles.temp}>
                  {parseFloat(day.temp.day).toFixed(1)}
                </Text>
                <Fontisto name={icons[day.weather[0].main]} size={68} color="#5E5816" />
              </View>
              <Text style={styles.description}>{day.weather[0].main}</Text>
              <Text style={styles.tinyText}>{day.weather[0].description}</Text>
            </View>
          ))
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: "#F6EAA1"
  },
  city: {
    flex: 1.2,
    justifyContent: "center", /** 상하위치 조정 */
    alignItems: "center", /** 좌우 조정 */
  },
  cityName: {
    fontSize: 68,
    fontWeight: "500",
    color: "#5E5816"
  },
  weather: {
    /*flex: 3,  ScrollView 일때는  flex가 안 먹힘, 스크린 사이즈를 넘어가니까 */
  },
  day: {
    // flex: 1, 스크롤되는 전체 사이즈를 가져와야 하므로 이건 안 먹힘
    width: SCREEN_WIDTH, 
    // width: 500,
    // 고정값은 반응형이 될 수 없다! 하지만 화면 중앙에 날짜가 나오게 하려면 width를 화면 너비만큼 주면 된다. 
    //각 폰마다 너비가 다르므로 고정값이 아닌 Dimensions api가 측정해주는 값으로 받아 사용한다. 
    alignItems: "flex-start",
    paddingHorizontal: 20,
  },
  temp: {
    marginTop: 50,
    fontWeight: "600",
    fontSize: 100,
    color: "#5E5816"
  },
  description: {
    marginTop: -10,
    fontSize: 30,
    color: "#5E5816",
    fontWeight: "500"
  },
  tinyText : {
    fontSize: 25,
    color: "#5E5816",
    marginTop: -5,
    fontWeight: "500"
  }
});
